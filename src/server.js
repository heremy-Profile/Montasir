import http from "node:http";
import { URL } from "node:url";
import { PersistentSisStore } from "./sis-store.js";
import { SisService } from "./sis-services.js";
import { createSessionToken, ensureRuntimeCredentials, publicUser, verifyPassword } from "./security.js";

const DEFAULT_STATE_PATH = new URL("../data/runtime-state.json", import.meta.url).pathname;
const jsonContentType = "application/json; charset=utf-8";
const SESSION_TTL_MS = 60 * 60 * 1000;
const LOCKOUT_AFTER_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const publicRoutes = [
  ["GET", /^\/api\/v1\/health$/],
  ["POST", /^\/api\/v1\/auth\/login$/],
  ["POST", /^\/api\/v1\/applications$/],
  ["GET", /^\/api\/v1\/transcripts\/verify\/[^/]+$/],
  ["GET", /^\/api\/v1\/cms\/pages$/],
  ["POST", /^\/api\/v1\/chat\/conversations$/]
];

export function createApiServer(options = {}) {
  const store = options.store || new PersistentSisStore(options.statePath || DEFAULT_STATE_PATH);
  const sessions = new Map();

  return http.createServer(async (req, res) => {
    setSecurityHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const state = await store.load();
      const credentialsChanged = ensureRuntimeCredentials(state);
      const service = new SisService(state);
      const url = new URL(req.url, "http://localhost");
      const body = await readJson(req);
      const route = matchRoute(req.method, url.pathname);

      if (!route) {
        throw new ApiError(404, "Endpoint not found.");
      }

      if (!isPublic(req.method, url.pathname)) {
        authenticate(req, service, sessions);
      }

      const result = await route.handler({ req, url, body, service, store, sessions, params: route.params });

      if (result?.persist !== false || credentialsChanged) {
        await store.save(service.state);
      }

      sendJson(res, result?.statusCode || 200, {
        success: true,
        message: result?.message || "Operation completed successfully",
        data: result?.data || {},
        meta: result?.meta || {}
      });
    } catch (error) {
      const status = error.statusCode || (error.name === "Error" ? 422 : 500);
      sendJson(res, status, {
        success: false,
        message: status === 500 ? "Unexpected server error." : error.message,
        errors: error.errors || {}
      });
    }
  });
}

function setSecurityHeaders(res) {
  res.setHeader("Content-Type", jsonContentType);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("Cache-Control", "no-store");
}

async function readJson(req) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Malformed JSON body.");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": jsonContentType });
  res.end(JSON.stringify(payload));
}

function isPublic(method, path) {
  return publicRoutes.some(([routeMethod, regex]) => routeMethod === method && regex.test(path));
}

function authenticate(req, service, sessions) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const session = sessions.get(token);
  if (!session) {
    throw new ApiError(401, "Authentication required.");
  }
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    throw new ApiError(401, "Session expired.");
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  service.setCurrentUser(session.userId);
}

function requireFields(body, fields) {
  const errors = {};
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      errors[field] = ["This field is required."];
    }
  }
  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, "Validation failed.", errors);
  }
}

function paginate(items, url) {
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const perPage = Math.min(Math.max(Number(url.searchParams.get("per_page") || 25), 1), 100);
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    meta: {
      page,
      per_page: perPage,
      total: items.length,
      last_page: Math.max(Math.ceil(items.length / perPage), 1)
    }
  };
}

function matchRoute(method, path) {
  for (const route of routes) {
    const match = route.regex.exec(path);
    if (route.method === method && match) {
      return {
        ...route,
        params: match.groups || {}
      };
    }
  }
  return null;
}

const routes = [
  {
    method: "GET",
    regex: /^\/api\/v1\/health$/,
    handler: async () => ({
      persist: false,
      data: {
        status: "ok",
        service: "akh-enterprise-sis-api"
      }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/auth\/login$/,
    handler: async ({ body, service, sessions }) => {
      requireFields(body, ["username", "password"]);
      const user = service.state.users.find(
        (item) => item.username === body.username || item.email === body.username
      );
      if (!user || user.status !== "active") {
        service.audit("login_failure", "auth", body.username, null, { username: body.username });
        throw new ApiError(401, "Invalid credentials.");
      }
      if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
        service.audit("login_locked", "auth", user.id, null, { lockedUntil: user.lockedUntil });
        throw new ApiError(423, "Account is temporarily locked.");
      }
      if (!verifyPassword(body.password, user.passwordHash)) {
        user.failedLoginCount = (user.failedLoginCount || 0) + 1;
        user.lastFailedLoginAt = new Date().toISOString();
        if (user.failedLoginCount >= LOCKOUT_AFTER_FAILURES) {
          user.lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
        }
        service.audit("login_failure", "auth", user.id, null, {
          username: body.username,
          failedLoginCount: user.failedLoginCount,
          lockedUntil: user.lockedUntil || null
        });
        throw new ApiError(user.lockedUntil ? 423 : 401, user.lockedUntil ? "Account is temporarily locked." : "Invalid credentials.");
      }

      service.setCurrentUser(user.id);
      user.failedLoginCount = 0;
      user.lockedUntil = null;
      const token = createSessionToken();
      const expiresAt = Date.now() + SESSION_TTL_MS;
      sessions.set(token, { userId: user.id, expiresAt });
      return {
        data: {
          token,
          expiresAt: new Date(expiresAt).toISOString(),
          user: publicUser(user),
          permissions: service.userPermissions(user)
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/auth\/logout$/,
    handler: async ({ req, service, sessions }) => {
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      sessions.delete(token);
      service.audit("logout", "auth", service.currentUser().id, null, { tokenRevoked: true });
      return { data: { revoked: true } };
    }
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/dashboard$/,
    handler: async ({ service }) => {
      service.assertPermission("view_dashboard");
      return { data: service.buildDashboard() };
    }
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/applications$/,
    handler: async ({ url, service }) => {
      service.assertPermission("approve_admissions");
      const status = url.searchParams.get("status");
      const programId = url.searchParams.get("program_id");
      const rows = service.state.applications.filter((application) => {
        if (status && application.status !== status) return false;
        if (programId && application.programId !== programId) return false;
        return true;
      });
      const page = paginate(rows, url);
      return { data: { applications: page.data }, meta: page.meta };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["firstNameEn", "lastNameEn", "email", "programId"]);
      return {
        statusCode: 201,
        message: "Application submitted",
        data: {
          application: service.createApplicant(body)
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications\/(?<id>[^/]+)\/approve$/,
    handler: async ({ service, body, url }) => ({
      data: { application: service.approveApplication(url.pathname.split("/")[4], body.note || "Approved through API.") }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications\/(?<id>[^/]+)\/reject$/,
    handler: async ({ service, body, url }) => ({
      data: { application: service.rejectApplication(url.pathname.split("/")[4], body.note || "Rejected through API.") }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications\/(?<id>[^/]+)\/issue-offer$/,
    handler: async ({ service, body, url }) => ({
      data: { offer: service.issueOffer(url.pathname.split("/")[4], body.expiresOn || "2026-08-01") }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications\/(?<id>[^/]+)\/accept-offer$/,
    handler: async ({ service, url }) => ({
      data: { offer: service.acceptOffer(url.pathname.split("/")[4]) }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/applications\/(?<id>[^/]+)\/convert-to-student$/,
    handler: async ({ service, url }) => ({
      statusCode: 201,
      data: { student: service.convertApplicationToStudent(url.pathname.split("/")[4]) }
    })
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/students$/,
    handler: async ({ url, service }) => {
      service.assertPermission("view_students");
      const query = (url.searchParams.get("q") || "").toLowerCase();
      const rows = service.state.students.filter((student) =>
        !query ||
        student.studentNumber.toLowerCase().includes(query) ||
        `${student.firstNameEn} ${student.lastNameEn}`.toLowerCase().includes(query)
      );
      const page = paginate(rows, url);
      return { data: { students: page.data }, meta: page.meta };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/students\/(?<id>[^/]+)\/holds$/,
    handler: async ({ body, service, url }) => {
      requireFields(body, ["holdType", "blocks"]);
      return {
        statusCode: 201,
        data: {
          hold: service.addStudentHold(url.pathname.split("/")[4], body.holdType, body.blocks, body.note || "")
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/registrations$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["studentId", "sectionId"]);
      return {
        statusCode: 201,
        data: {
          registration: service.registerStudent(body.studentId, body.sectionId, { override: Boolean(body.override) })
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/attendance\/sections\/(?<id>[^/]+)\/sessions$/,
    handler: async ({ body, service, url }) => {
      requireFields(body, ["meetingDate", "records"]);
      return {
        statusCode: 201,
        data: {
          session: service.markAttendance(url.pathname.split("/")[5], body.meetingDate, body.records, body.status || "submitted")
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/grades$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["studentId", "courseId", "semesterId", "percentage"]);
      return {
        statusCode: 201,
        data: {
          grade: service.submitGrade(body.studentId, body.courseId, body.semesterId, Number(body.percentage))
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/grades\/(?<id>[^/]+)\/approve$/,
    handler: async ({ service, url }) => ({
      data: { grade: service.approveGrade(url.pathname.split("/")[4]) }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/transcripts\/(?<id>[^/]+)\/issue$/,
    handler: async ({ body, service, url }) => ({
      statusCode: 201,
      data: { transcript: service.issueTranscript(url.pathname.split("/")[4], Boolean(body.official)) }
    })
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/transcripts\/verify\/(?<code>[^/]+)$/,
    handler: async ({ service, url }) => ({
      data: {
        verification: service.verifyTranscript(decodeURIComponent(url.pathname.split("/")[5]))
      }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/finance\/payments$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["invoiceId", "amount", "method"]);
      return {
        statusCode: 201,
        data: {
          payment: service.recordPayment(body.invoiceId, Number(body.amount), body.method, body.reference || "")
        }
      };
    }
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/finance\/invoices$/,
    handler: async ({ url, service }) => {
      service.assertPermission("view_financial_reports");
      const studentId = url.searchParams.get("student_id");
      const status = url.searchParams.get("status");
      const rows = service.state.invoices.filter((invoice) => {
        if (studentId && invoice.studentId !== studentId) return false;
        if (status && invoice.status !== status) return false;
        return true;
      });
      const page = paginate(rows, url);
      return { data: { invoices: page.data }, meta: page.meta };
    }
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/finance\/students\/(?<id>[^/]+)\/ledger$/,
    handler: async ({ service, url }) => ({
      data: {
        ledger: service.studentLedger(url.pathname.split("/")[5])
      }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/requests$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["studentId", "type"]);
      return {
        statusCode: 201,
        data: { request: service.createRequest(body.studentId, body.type, body) }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/workflows\/(?<id>[^/]+)\/actions$/,
    handler: async ({ body, service, url }) => {
      requireFields(body, ["action"]);
      return {
        data: {
          workflow: service.actOnWorkflow(url.pathname.split("/")[4], body.action, body.comment || "")
        }
      };
    }
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/workflows\/(?<id>[^/]+)\/timeline$/,
    handler: async ({ service, url }) => ({
      data: {
        timeline: service.workflowTimeline(url.pathname.split("/")[4])
      }
    })
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/cms\/pages$/,
    handler: async ({ service }) => ({
      persist: false,
      data: {
        pages: service.state.cmsPages.filter((page) => page.status === "published")
      }
    })
  },
  {
    method: "PATCH",
    regex: /^\/api\/v1\/cms\/pages\/(?<id>[^/]+)$/,
    handler: async ({ body, service, url }) => ({
      data: { page: service.publishCmsPage(url.pathname.split("/")[5], body) }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/chat\/conversations$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["visitorName", "message"]);
      return {
        statusCode: 201,
        data: {
          conversation: service.createChatConversation(body.visitorName, body.language || "en", body.message)
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/reports\/(?<name>[^/]+)\/export$/,
    handler: async ({ service, url }) => ({
      data: {
        export: service.exportReport(url.pathname.split("/")[4])
      }
    })
  },
  {
    method: "GET",
    regex: /^\/api\/v1\/audit-logs$/,
    handler: async ({ url, service }) => {
      service.assertPermission("view_audit_logs");
      const page = paginate(service.state.auditLogs, url);
      return { data: { auditLogs: page.data }, meta: page.meta };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/media-files$/,
    handler: async ({ body, service }) => {
      requireFields(body, ["folder", "originalName", "mimeType", "extension", "sizeBytes", "checksum"]);
      return {
        statusCode: 201,
        data: {
          mediaFile: service.registerMediaFile(body)
        }
      };
    }
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/notifications\/process$/,
    handler: async ({ body, service }) => ({
      data: {
        notifications: service.processNotifications(body.limit || 25)
      }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/scheduler\/run$/,
    handler: async ({ body, service }) => ({
      data: {
        scheduler: service.runScheduledJobs(body.jobKey || "all")
      }
    })
  },
  {
    method: "POST",
    regex: /^\/api\/v1\/admin\/reset$/,
    handler: async ({ store }) => {
      const state = await store.reset();
      return {
        persist: false,
        data: {
          reset: true,
          version: state.meta.version
        }
      };
    }
  }
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  const statePath = process.env.SIS_STATE_PATH || DEFAULT_STATE_PATH;
  const server = createApiServer({ statePath });
  server.listen(port, () => {
    console.log(`AKH SIS API listening on http://localhost:${port}`);
  });
}
