import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer } from "../src/server.js";

const tempDir = await mkdtemp(join(tmpdir(), "akh-sis-api-"));
const statePath = join(tempDir, "state.json");
const server = createApiServer({ statePath });

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

async function request(method, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  return { response, payload };
}

try {
  {
    const { response, payload } = await request("GET", "/api/v1/health");
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.data.status, "ok");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }

  const badLogin = await request("POST", "/api/v1/auth/login", { username: "superadmin", password: "wrong" });
  assert.equal(badLogin.response.status, 401);
  assert.equal(badLogin.payload.success, false);

  const login = await request("POST", "/api/v1/auth/login", { username: "superadmin", password: "ChangeMe!2026" });
  assert.equal(login.response.status, 200);
  assert.match(login.payload.data.token, /^sis_/);
  assert.ok(login.payload.data.expiresAt);
  assert.equal(login.payload.data.user.passwordHash, undefined);
  const token = login.payload.data.token;

  const application = await request("POST", "/api/v1/applications", {
    firstNameEn: "Sara",
    lastNameEn: "Haddad",
    firstNameAr: "سارة",
    lastNameAr: "حداد",
    email: "sara.haddad@example.test",
    phone: "+971500000001",
    programId: "program_bsn"
  });
  assert.equal(application.response.status, 201);
  assert.equal(application.payload.data.application.status, "submitted");
  const applicationId = application.payload.data.application.id;

  const approved = await request("POST", `/api/v1/applications/${applicationId}/approve`, { note: "API approval" }, token);
  assert.equal(approved.response.status, 200);
  assert.equal(approved.payload.data.application.status, "eligible");

  const offer = await request("POST", `/api/v1/applications/${applicationId}/issue-offer`, { expiresOn: "2026-08-01" }, token);
  assert.equal(offer.response.status, 200);
  assert.equal(offer.payload.data.offer.status, "sent");

  const accepted = await request("POST", `/api/v1/applications/${applicationId}/accept-offer`, undefined, token);
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.payload.data.offer.status, "accepted");

  const converted = await request("POST", `/api/v1/applications/${applicationId}/convert-to-student`, undefined, token);
  assert.equal(converted.response.status, 201);
  assert.match(converted.payload.data.student.studentNumber, /^AKU-2026-\d{6}$/);
  const studentId = converted.payload.data.student.id;

  const registration = await request("POST", "/api/v1/registrations", {
    studentId,
    sectionId: "section_anat101_a"
  }, token);
  assert.equal(registration.response.status, 201);
  assert.equal(registration.payload.data.registration.status, "registered");

  const grade = await request("POST", "/api/v1/grades", {
    studentId,
    courseId: "course_anat101",
    semesterId: "sem_fall_2026",
    percentage: 88
  }, token);
  assert.equal(grade.response.status, 201);
  assert.equal(grade.payload.data.grade.letter, "B");

  const approvedGrade = await request("POST", `/api/v1/grades/${grade.payload.data.grade.id}/approve`, undefined, token);
  assert.equal(approvedGrade.response.status, 200);
  assert.equal(approvedGrade.payload.data.grade.status, "approved");

  const students = await request("GET", "/api/v1/students?q=AKU", undefined, token);
  assert.equal(students.response.status, 200);
  assert.equal(students.payload.meta.total, 1);
  assert.equal(students.payload.data.students[0].gpa, 3);

  const invoices = await request("GET", `/api/v1/finance/invoices?student_id=${studentId}`, undefined, token);
  assert.equal(invoices.response.status, 200);
  assert.equal(invoices.payload.data.invoices.length, 1);

  const invoice = invoices.payload.data.invoices[0];
  const payment = await request("POST", "/api/v1/finance/payments", {
    invoiceId: invoice.id,
    amount: invoice.balance,
    method: "bank_transfer",
    reference: "API-TEST-1"
  }, token);
  assert.equal(payment.response.status, 201);
  assert.match(payment.payload.data.payment.receiptNumber, /^RCT-2026-\d{6}$/);

  const audit = await request("GET", "/api/v1/audit-logs?per_page=5", undefined, token);
  assert.equal(audit.response.status, 200);
  assert.equal(audit.payload.meta.per_page, 5);
  assert.ok(audit.payload.data.auditLogs.length >= 1);

  const media = await request("POST", "/api/v1/media-files", {
    folder: "cms/home",
    originalName: "hero.png",
    mimeType: "image/png",
    extension: "png",
    sizeBytes: 2048,
    checksum: "a".repeat(64)
  }, token);
  assert.equal(media.response.status, 201);
  assert.equal(media.payload.data.mediaFile.visibility, "private");

  const blockedMedia = await request("POST", "/api/v1/media-files", {
    folder: "cms/home",
    originalName: "shell.php",
    mimeType: "application/x-php",
    extension: "php",
    sizeBytes: 200,
    checksum: "b".repeat(64)
  }, token);
  assert.equal(blockedMedia.response.status, 422);
  assert.equal(blockedMedia.payload.success, false);

  const notifications = await request("POST", "/api/v1/notifications/process", { limit: 10 }, token);
  assert.equal(notifications.response.status, 200);
  assert.ok(notifications.payload.data.notifications.length >= 1);
  assert.ok(notifications.payload.data.notifications.every((notification) => notification.status === "sent"));

  const unauthorized = await request("GET", "/api/v1/students");
  assert.equal(unauthorized.response.status, 401);
  assert.equal(unauthorized.payload.success, false);

  console.log("SIS API tests passed.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await rm(tempDir, { recursive: true, force: true });
}
