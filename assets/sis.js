import { SisService, createInitialState } from "../src/sis-services.js";

const STORAGE_KEY = "akh-enterprise-sis-state";

const copy = {
  en: {
    platform: "Enterprise SIS",
    apply: "Apply now",
    portal: "Open portal",
    dashboard: "Dashboard",
    admissions: "Admissions",
    students: "Students",
    academics: "Academics",
    registration: "Registration",
    attendance: "Attendance",
    grades: "Grades",
    finance: "Finance",
    requests: "Requests",
    cms: "CMS",
    reports: "Reports",
    audit: "Audit",
    security: "Security",
    publicWebsite: "Public Website",
    saved: "Saved successfully.",
    error: "Action failed"
  },
  ar: {
    platform: "نظام معلومات الطلبة",
    apply: "قدّم الآن",
    portal: "فتح البوابة",
    dashboard: "لوحة المعلومات",
    admissions: "القبول",
    students: "الطلبة",
    academics: "الشؤون الأكاديمية",
    registration: "التسجيل",
    attendance: "الحضور",
    grades: "الدرجات",
    finance: "المالية",
    requests: "الطلبات",
    cms: "إدارة المحتوى",
    reports: "التقارير",
    audit: "التدقيق",
    security: "الأمن",
    publicWebsite: "الموقع العام",
    saved: "تم الحفظ بنجاح.",
    error: "تعذر تنفيذ الإجراء"
  }
};

const menuItems = [
  { key: "dashboard", label: "Dashboard", permission: "view_dashboard" },
  { key: "admissions", label: "Admissions", permission: "approve_admissions" },
  { key: "students", label: "Students", permission: "view_students" },
  { key: "academics", label: "Academic Setup", permission: "manage_courses" },
  { key: "registration", label: "Registration", permission: "view_dashboard" },
  { key: "attendance", label: "Attendance", permission: "manage_attendance" },
  { key: "grades", label: "Exams & Grades", permission: "submit_grades" },
  { key: "finance", label: "Finance", permission: "view_financial_reports" },
  { key: "requests", label: "Requests", permission: "view_dashboard" },
  { key: "cms", label: "CMS / Website", permission: "manage_cms" },
  { key: "reports", label: "Reports", permission: "export_reports" },
  { key: "security", label: "Users & Security", permission: "manage_users" },
  { key: "audit", label: "Audit Logs", permission: "view_audit_logs" }
];

let service = new SisService(loadState());
let currentPanel = "dashboard";
let currentLanguage = service.state.meta.currentLanguage || "en";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return createInitialState();
  }
  try {
    return JSON.parse(stored);
  } catch {
    return createInitialState();
  }
}

function persist() {
  service.state.meta.currentLanguage = currentLanguage;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(service.snapshot()));
}

function resetDemo() {
  service = new SisService(createInitialState());
  currentLanguage = "en";
  currentPanel = "dashboard";
  persist();
  renderAll();
  toast("System data reset.");
}

function t(key) {
  return copy[currentLanguage][key] || copy.en[key] || key;
}

function statusBadge(status) {
  return `<span class="badge ${String(status).replaceAll("_", "-")}">${String(status).replaceAll("_", " ")}</span>`;
}

function toast(message, type = "success") {
  const area = $("#notice-area");
  if (!area) return;
  area.innerHTML = `<div class="notice ${type}">${message}</div>`;
  setTimeout(() => {
    if (area.innerHTML.includes(message)) area.innerHTML = "";
  }, 4500);
}

function renderAll() {
  document.documentElement.lang = currentLanguage;
  document.body.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  $$("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  renderRoleSwitcher();
  renderMenu();
  renderPanel();
  renderPublicData();
}

function renderRoleSwitcher() {
  const select = $("#user-switcher");
  const users = service.state.users;
  select.innerHTML = users
    .map((user) => `<option value="${user.id}" ${user.id === service.state.meta.currentUserId ? "selected" : ""}>${user.name} (${user.roles.join(", ")})</option>`)
    .join("");
}

function renderMenu() {
  const menu = $("#portal-menu");
  menu.innerHTML = menuItems
    .filter((item) => service.can(item.permission))
    .map((item) => `<button data-panel="${item.key}" class="${currentPanel === item.key ? "active" : ""}">${item.label}</button>`)
    .join("");
  menu.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentPanel = button.dataset.panel;
      renderAll();
    });
  });
  if (!service.can(menuItems.find((item) => item.key === currentPanel)?.permission || "view_dashboard")) {
    currentPanel = "dashboard";
  }
}

function renderPanel() {
  const panel = $("#portal-panel");
  const renderers = {
    dashboard: renderDashboard,
    admissions: renderAdmissions,
    students: renderStudents,
    academics: renderAcademics,
    registration: renderRegistration,
    attendance: renderAttendance,
    grades: renderGrades,
    finance: renderFinance,
    requests: renderRequests,
    cms: renderCms,
    reports: renderReports,
    security: renderSecurity,
    audit: renderAudit
  };
  panel.innerHTML = renderers[currentPanel] ? renderers[currentPanel]() : renderDashboard();
  bindPanelActions();
}

function renderDashboard() {
  const dashboard = service.buildDashboard();
  const studentCount = service.state.students.length;
  const applicationCount = service.state.applications.length;
  const invoiceBalance = dashboard.outstanding.toLocaleString();
  const registrations = service.state.registrations.length;
  return `
    <div class="workspace-header">
      <div>
        <p class="eyebrow">${t("platform")}</p>
        <h2>${t("dashboard")}</h2>
      </div>
      <div class="toolbar">
        <button class="button secondary" data-action="export-report">Export JSON</button>
        <button class="button danger" data-action="reset-demo">Reset data</button>
      </div>
    </div>
    <div class="stats">
      ${stat(applicationCount, "Applications")}
      ${stat(studentCount, "Students")}
      ${stat(registrations, "Active registrations")}
      ${stat(`AED ${invoiceBalance}`, "Outstanding balance")}
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Enterprise workflow status</h3>
        <div class="grid two">
          ${workflowCard("Admissions", dashboard.applications)}
          ${workflowCard("Students", dashboard.students)}
          ${workflowCard("Registration", dashboard.registrations)}
          ${workflowCard("Invoices", dashboard.invoices)}
        </div>
      </div>
      <div class="card">
        <h3>Security and audit</h3>
        <p>Role-based menus are filtered client-side here and must be enforced server-side by the API middleware documented in this build.</p>
        <div class="timeline">
          ${service.state.auditLogs.slice(0, 8).map(auditItem).join("")}
        </div>
      </div>
    </div>
  `;
}

function stat(value, label) {
  return `<div class="stat"><b>${value}</b><span>${label}</span></div>`;
}

function workflowCard(title, counts) {
  const rows = Object.entries(counts || {}).map(([key, value]) => `<p><strong>${key.replaceAll("_", " ")}:</strong> ${value}</p>`).join("");
  return `<div class="card"><h3>${title}</h3>${rows || "<p>No records yet.</p>"}</div>`;
}

function auditItem(item) {
  return `<div class="timeline-item"><strong>${item.action.replaceAll("_", " ")}</strong><span>${item.module} • ${new Date(item.createdAt).toLocaleString()}</span></div>`;
}

function renderAdmissions() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Applicant portal + admissions admin</p><h2>${t("admissions")}</h2></div>
      <button class="button" data-action="seed-applicant">Create sample applicant</button>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Applications</h3>
        ${table(
          ["Applicant", "Program", "Status", "Submitted", "Actions"],
          service.state.applications.map((application) => {
            const applicant = service.state.applicants.find((item) => item.id === application.applicantId);
            const program = service.state.programs.find((item) => item.id === application.programId);
            return [
              applicant ? `${applicant.firstNameEn} ${applicant.lastNameEn}<br><small>${applicant.applicantNumber}</small>` : "Unknown",
              program?.code || "-",
              statusBadge(application.status),
              application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "-",
              admissionActions(application)
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>New applicant</h3>
        <form data-form="applicant" class="form-grid">
          <input name="firstNameEn" placeholder="First name English" required>
          <input name="lastNameEn" placeholder="Last name English" required>
          <input name="firstNameAr" placeholder="الاسم الأول بالعربية">
          <input name="lastNameAr" placeholder="اسم العائلة بالعربية">
          <input name="email" type="email" placeholder="Email" required>
          <input name="phone" placeholder="Phone">
          <select name="programId" required>${service.state.programs.map((program) => `<option value="${program.id}">${program.code} - ${program.nameEn}</option>`).join("")}</select>
          <textarea class="full" name="notes" placeholder="Notes / missing documents"></textarea>
          <button class="button full" type="submit">Submit application</button>
        </form>
      </div>
    </div>
  `;
}

function admissionActions(application) {
  const actions = [];
  if (["submitted", "under_review"].includes(application.status)) {
    actions.push(`<button class="button small" data-action="approve-application" data-id="${application.id}">Approve</button>`);
    actions.push(`<button class="button small danger" data-action="reject-application" data-id="${application.id}">Reject</button>`);
  }
  if (application.status === "eligible") actions.push(`<button class="button small" data-action="issue-offer" data-id="${application.id}">Issue offer</button>`);
  if (application.status === "offer_sent") actions.push(`<button class="button small gold" data-action="accept-offer" data-id="${application.id}">Accept offer</button>`);
  if (["offer_accepted", "eligible"].includes(application.status)) actions.push(`<button class="button small" data-action="convert-student" data-id="${application.id}">Convert</button>`);
  return `<div class="toolbar">${actions.join("") || "<small>No actions</small>"}</div>`;
}

function renderStudents() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Registrar and student affairs</p><h2>${t("students")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Student records</h3>
        ${table(
          ["Student", "Program", "Academic", "Financial", "GPA", "Actions"],
          service.state.students.map((student) => {
            const program = service.state.programs.find((item) => item.id === student.programId);
            return [
              `${student.firstNameEn} ${student.lastNameEn}<br><small>${student.studentNumber}</small>`,
              program?.code || "-",
              statusBadge(student.academicStatus),
              statusBadge(student.financialStatus),
              student.gpa.toFixed(2),
              `<div class="toolbar">
                <button class="button small" data-action="add-financial-hold" data-id="${student.id}">Add hold</button>
                <button class="button small secondary" data-action="issue-transcript" data-id="${student.id}">Transcript</button>
              </div>`
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>Active holds</h3>
        ${table(
          ["Student", "Type", "Blocks", "Status", "Action"],
          service.state.studentHolds.map((hold) => {
            const student = service.state.students.find((item) => item.id === hold.studentId);
            return [
              student?.studentNumber || "-",
              hold.holdType,
              hold.blocks.join(", "),
              statusBadge(hold.status),
              hold.status === "active" ? `<button class="button small" data-action="release-hold" data-id="${hold.id}">Release</button>` : "-"
            ];
          })
        )}
      </div>
    </div>
  `;
}

function renderAcademics() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Programs, courses, sections, timetable</p><h2>${t("academics")}</h2></div>
    </div>
    <div class="grid three">
      <div class="card"><h3>Programs</h3>${table(["Code", "Name", "Credits", "Status"], service.state.programs.map((p) => [p.code, p.nameEn, p.creditHours, statusBadge(p.status)]))}</div>
      <div class="card"><h3>Courses</h3>${table(["Code", "Course", "Credits", "Prerequisites"], service.state.courses.map((c) => [c.code, c.titleEn, c.creditHours, c.prerequisites.length || "None"]))}</div>
      <div class="card"><h3>Sections</h3>${table(["Section", "Room", "Capacity", "Meetings"], service.state.sections.map((s) => [s.code, s.roomId, `${s.enrolled}/${s.capacity}`, s.meetings.map((m) => `${m.day} ${m.startsAt}`).join("<br>")]))}</div>
    </div>
  `;
}

function renderRegistration() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Student registration rules</p><h2>${t("registration")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Registered courses</h3>
        ${table(
          ["Student", "Section", "Status", "Registered", "Action"],
          service.state.registrations.map((registration) => {
            const student = service.state.students.find((item) => item.id === registration.studentId);
            const section = service.state.sections.find((item) => item.id === registration.sectionId);
            return [
              student?.studentNumber || "-",
              section?.code || "-",
              statusBadge(registration.status),
              registration.registeredAt ? new Date(registration.registeredAt).toLocaleString() : "-",
              registration.status === "registered" ? `<button class="button small danger" data-action="drop-registration" data-id="${registration.id}">Drop</button>` : "-"
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>Register a student</h3>
        <form data-form="registration" class="form-grid">
          <select name="studentId" required>${service.state.students.map((student) => `<option value="${student.id}">${student.studentNumber} - ${student.firstNameEn}</option>`).join("")}</select>
          <select name="sectionId" required>${service.state.sections.map((section) => `<option value="${section.id}">${section.code} (${section.enrolled}/${section.capacity})</option>`).join("")}</select>
          <label><input type="checkbox" name="override" style="width:auto"> Registrar override</label>
          <button class="button full" type="submit">Register</button>
        </form>
      </div>
    </div>
  `;
}

function renderAttendance() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Faculty portal</p><h2>${t("attendance")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Class sessions</h3>
        ${table(
          ["Section", "Date", "Status", "Records"],
          service.state.attendance.map((session) => [session.sectionId, session.meetingDate, statusBadge(session.status), session.records.length])
        )}
      </div>
      <div class="card">
        <h3>Mark attendance</h3>
        <form data-form="attendance" class="form-grid">
          <select name="sectionId" required>${service.state.sections.map((section) => `<option value="${section.id}">${section.code}</option>`).join("")}</select>
          <input type="date" name="meetingDate" required value="${new Date().toISOString().slice(0, 10)}">
          <select name="status"><option>present</option><option>absent</option><option>late</option><option>excused</option></select>
          <button class="button full" type="submit">Mark all registered students</button>
        </form>
      </div>
    </div>
  `;
}

function renderGrades() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Assessment, grade approval, GPA</p><h2>${t("grades")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Grades</h3>
        ${table(
          ["Student", "Course", "Percent", "Grade", "Status", "Action"],
          service.state.grades.map((grade) => {
            const student = service.state.students.find((item) => item.id === grade.studentId);
            const course = service.state.courses.find((item) => item.id === grade.courseId);
            return [
              student?.studentNumber || "-",
              course?.code || "-",
              grade.percentage,
              grade.letter,
              statusBadge(grade.status),
              grade.status === "submitted" ? `<button class="button small" data-action="approve-grade" data-id="${grade.id}">Approve</button>` : "-"
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>Submit grade</h3>
        <form data-form="grade" class="form-grid">
          <select name="studentId" required>${service.state.students.map((student) => `<option value="${student.id}">${student.studentNumber}</option>`).join("")}</select>
          <select name="courseId" required>${service.state.courses.map((course) => `<option value="${course.id}">${course.code}</option>`).join("")}</select>
          <select name="semesterId" required>${service.state.semesters.map((semester) => `<option value="${semester.id}">${semester.nameEn}</option>`).join("")}</select>
          <input type="number" name="percentage" min="0" max="100" step="0.01" placeholder="Percentage" required>
          <button class="button full" type="submit">Submit grade</button>
        </form>
      </div>
    </div>
  `;
}

function renderFinance() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Invoices, receipts, holds</p><h2>${t("finance")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Invoices</h3>
        ${table(
          ["Invoice", "Student", "Amount", "Balance", "Status", "Action"],
          service.state.invoices.map((invoice) => {
            const student = service.state.students.find((item) => item.id === invoice.studentId);
            return [
              invoice.invoiceNumber,
              student?.studentNumber || "-",
              `AED ${invoice.amount}`,
              `AED ${invoice.balance}`,
              statusBadge(invoice.status),
              invoice.balance > 0 ? `<button class="button small" data-action="pay-invoice" data-id="${invoice.id}">Record payment</button>` : "-"
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>Payments</h3>
        ${table(["Receipt", "Method", "Amount", "Status"], service.state.payments.map((payment) => [payment.receiptNumber, payment.method, `AED ${payment.amount}`, statusBadge(payment.status)]))}
      </div>
    </div>
  `;
}

function renderRequests() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Workflow engine</p><h2>${t("requests")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>Student requests</h3>
        ${table(
          ["Request", "Student", "Type", "Status", "Actions"],
          service.state.requests.map((request) => {
            const student = service.state.students.find((item) => item.id === request.studentId);
            return [
              request.requestNumber,
              student?.studentNumber || "-",
              request.type,
              statusBadge(request.status),
              `<div class="toolbar"><button class="button small" data-action="approve-request" data-id="${request.id}">Approve</button><button class="button small danger" data-action="reject-request" data-id="${request.id}">Reject</button></div>`
            ];
          })
        )}
      </div>
      <div class="card">
        <h3>Create request</h3>
        <form data-form="request" class="form-grid">
          <select name="studentId" required>${service.state.students.map((student) => `<option value="${student.id}">${student.studentNumber}</option>`).join("")}</select>
          <select name="type"><option>Enrollment letter</option><option>Transcript request</option><option>Course withdrawal</option><option>Program change</option><option>General request</option></select>
          <textarea class="full" name="description" placeholder="Request details"></textarea>
          <button class="button full" type="submit">Submit request</button>
        </form>
      </div>
    </div>
  `;
}

function renderCms() {
  const page = service.state.cmsPages[0];
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Bilingual editable public content</p><h2>${t("cms")}</h2></div>
    </div>
    <div class="panel-grid">
      <div class="card">
        <h3>CMS pages</h3>
        ${table(["Slug", "Title EN", "Title AR", "Status"], service.state.cmsPages.map((item) => [item.slugEn, item.titleEn, item.titleAr, statusBadge(item.status)]))}
      </div>
      <div class="card">
        <h3>Edit home page</h3>
        <form data-form="cms" class="form-grid">
          <input name="titleEn" value="${escapeAttr(page.titleEn)}" required>
          <input name="titleAr" value="${escapeAttr(page.titleAr)}" required>
          <textarea class="full" name="bodyEn" required>${escapeHtml(page.bodyEn)}</textarea>
          <textarea class="full" name="bodyAr" required>${escapeHtml(page.bodyAr)}</textarea>
          <button class="button full" type="submit">Publish CMS page</button>
        </form>
      </div>
    </div>
  `;
}

function renderReports() {
  const dashboard = service.buildDashboard();
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Analytics and export</p><h2>${t("reports")}</h2></div>
      <button class="button" data-action="export-report">Export report</button>
    </div>
    <div class="grid three">
      <div class="card"><h3>Admissions report</h3>${jsonBlock(dashboard.applications)}</div>
      <div class="card"><h3>Finance report</h3><p>Outstanding balance: <strong>AED ${dashboard.outstanding}</strong></p>${jsonBlock(dashboard.invoices)}</div>
      <div class="card"><h3>System activity</h3><p>${dashboard.auditEvents} audit events recorded.</p><p>${dashboard.unreadNotifications} notifications queued or unread.</p></div>
    </div>
  `;
}

function renderSecurity() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">RBAC</p><h2>${t("security")}</h2></div>
    </div>
    <div class="grid two">
      <div class="card"><h3>Roles</h3>${table(["Role", "Protected"], service.state.roles.map((role) => [role.name, role.protected ? "Yes" : "No"]))}</div>
      <div class="card"><h3>Current user permissions</h3><p>${service.userPermissions().map((permission) => `<span class="badge open">${permission}</span>`).join(" ")}</p></div>
    </div>
  `;
}

function renderAudit() {
  return `
    <div class="workspace-header">
      <div><p class="eyebrow">Immutable action trail</p><h2>${t("audit")}</h2></div>
    </div>
    <div class="card">
      ${table(
        ["When", "User", "Module", "Action", "Record"],
        service.state.auditLogs.map((entry) => [
          new Date(entry.createdAt).toLocaleString(),
          service.state.users.find((user) => user.id === entry.userId)?.name || "-",
          entry.module,
          entry.action,
          entry.recordId
        ])
      )}
    </div>
  `;
}

function table(headers, rows) {
  if (!rows.length) {
    return `<div class="notice">No records yet. Use the form or workflow actions to create live data.</div>`;
  }
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function jsonBlock(data) {
  return `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function bindPanelActions() {
  $("#portal-panel").querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => runAction(button.dataset.action, button.dataset.id));
  });

  $("#portal-panel").querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      runForm(form.dataset.form, new FormData(form));
    });
  });
}

function runAction(action, id) {
  try {
    switch (action) {
      case "seed-applicant":
        service.createApplicant({
          firstNameEn: "Mariam",
          lastNameEn: "Al Nuaimi",
          firstNameAr: "مريم",
          lastNameAr: "النعيمي",
          email: `mariam.${Date.now()}@example.test`,
          phone: "+971501234567",
          programId: "program_bsn",
          documents: ["passport", "high_school_certificate"]
        });
        break;
      case "approve-application":
        service.approveApplication(id, "Reviewed by admissions.");
        break;
      case "reject-application":
        service.rejectApplication(id, "Entry requirements not met.");
        break;
      case "issue-offer":
        service.issueOffer(id, "2026-08-01");
        break;
      case "accept-offer":
        service.acceptOffer(id);
        break;
      case "convert-student":
        service.convertApplicationToStudent(id);
        break;
      case "add-financial-hold":
        service.addStudentHold(id, "financial", ["registration", "transcript"], "Outstanding balance.");
        break;
      case "release-hold":
        service.removeStudentHold(id);
        break;
      case "issue-transcript":
        window.alert(JSON.stringify(service.issueTranscript(id, true), null, 2));
        break;
      case "drop-registration":
        service.dropRegistration(id, "Dropped from portal.");
        break;
      case "approve-grade":
        service.approveGrade(id);
        break;
      case "pay-invoice": {
        const invoice = service.state.invoices.find((item) => item.id === id);
        service.recordPayment(id, invoice.balance, "card", `WEB-${Date.now()}`);
        break;
      }
      case "approve-request":
        service.actOnRequest(id, "approved", "Approved.");
        break;
      case "reject-request":
        service.actOnRequest(id, "rejected", "Rejected.");
        break;
      case "export-report":
        downloadJson(service.exportReport("enterprise_dashboard"), `akh-sis-report-${Date.now()}.json`);
        break;
      case "reset-demo":
        resetDemo();
        return;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    persist();
    renderAll();
    toast(t("saved"));
  } catch (error) {
    toast(`${t("error")}: ${error.message}`, "error");
  }
}

function runForm(formName, data) {
  try {
    switch (formName) {
      case "applicant":
        service.createApplicant(Object.fromEntries(data.entries()));
        break;
      case "registration":
        service.registerStudent(data.get("studentId"), data.get("sectionId"), { override: data.get("override") === "on" });
        break;
      case "attendance": {
        const sectionId = data.get("sectionId");
        const records = service.state.registrations
          .filter((registration) => registration.sectionId === sectionId && registration.status === "registered")
          .map((registration) => ({ studentId: registration.studentId, status: data.get("status") }));
        service.markAttendance(sectionId, data.get("meetingDate"), records);
        break;
      }
      case "grade":
        service.submitGrade(data.get("studentId"), data.get("courseId"), data.get("semesterId"), Number(data.get("percentage")));
        break;
      case "request":
        service.createRequest(data.get("studentId"), data.get("type"), { description: data.get("description") });
        break;
      case "cms":
        service.publishCmsPage("page_home", Object.fromEntries(data.entries()));
        break;
      default:
        throw new Error(`Unknown form: ${formName}`);
    }
    persist();
    renderAll();
    toast(t("saved"));
  } catch (error) {
    toast(`${t("error")}: ${error.message}`, "error");
  }
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderPublicData() {
  const home = service.state.cmsPages.find((page) => page.id === "page_home") || service.state.cmsPages[0];
  $("#cms-home-title").textContent = currentLanguage === "ar" ? home.titleAr : home.titleEn;
  $("#cms-home-body").textContent = currentLanguage === "ar" ? home.bodyAr : home.bodyEn;
  $("#program-list").innerHTML = service.state.programs.map((program) => `
    <article class="card">
      <h3>${currentLanguage === "ar" ? program.nameAr : program.nameEn}</h3>
      <p><strong>${program.code}</strong> • ${program.degreeLevel} • ${program.creditHours} credit hours</p>
      <p>${currentLanguage === "ar" ? "رسوم الساعة المعتمدة" : "Tuition per credit"}: AED ${program.tuitionPerCredit}</p>
      <a class="button secondary" href="#apply">${t("apply")}</a>
    </article>
  `).join("");
}

function bindGlobal() {
  $("#language-toggle").addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ar" : "en";
    persist();
    renderAll();
  });

  $("#user-switcher").addEventListener("change", (event) => {
    service.setCurrentUser(event.target.value);
    persist();
    renderAll();
  });

  $("#public-apply-form").addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      service.createApplicant(Object.fromEntries(new FormData(event.target).entries()));
      persist();
      event.target.reset();
      renderAll();
      toast("Application submitted. Admissions can now review it in the portal.");
      location.hash = "#portal";
      currentPanel = "admissions";
      renderAll();
    } catch (error) {
      toast(error.message, "error");
    }
  });

  $("#chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const message = data.get("message");
    if (!message) return;
    service.createChatConversation("Website visitor", currentLanguage, message);
    persist();
    renderChat(message);
    event.target.reset();
  });
}

function renderChat(message = "") {
  const messages = $("#chat-messages");
  if (message) {
    messages.insertAdjacentHTML("beforeend", `<div class="bubble">${escapeHtml(message)}</div>`);
    messages.insertAdjacentHTML("beforeend", `<div class="bubble agent">${currentLanguage === "ar" ? "تم إرسال طلبك إلى فريق القبول. لن يتم إغلاق المحادثة ويمكنك المتابعة." : "Your request has been sent to admissions. This chat stays open so you can continue."}</div>`);
  }
}

bindGlobal();
renderAll();
