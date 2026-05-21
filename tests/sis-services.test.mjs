import assert from "node:assert/strict";
import { SisService, createInitialState } from "../src/sis-services.js";

function seedAcceptedStudent(service) {
  const application = service.createApplicant({
    firstNameEn: "Mariam",
    lastNameEn: "Al Nuaimi",
    firstNameAr: "مريم",
    lastNameAr: "النعيمي",
    email: "mariam@example.test",
    phone: "+971501234567",
    nationality: "UAE",
    programId: "program_bsn",
    documents: ["passport", "high_school_certificate"]
  });

  service.approveApplication(application.id, "Meets entry criteria.");
  service.issueOffer(application.id, "2026-08-01");
  service.acceptOffer(application.id);
  return service.convertApplicationToStudent(application.id);
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);

  assert.match(student.studentNumber, /^AKU-2026-\d{6}$/);
  assert.equal(service.snapshot().students.length, 1);
  assert.equal(service.snapshot().invoices.length, 1);
  assert.ok(service.snapshot().auditLogs.some((entry) => entry.action === "applicant_converted_to_student"));
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);
  const registration = service.registerStudent(student.id, "section_anat101_a");

  assert.equal(registration.status, "registered");
  assert.equal(service.snapshot().sections[0].enrolled, 1);
  assert.throws(
    () => service.registerStudent(student.id, "section_anat101_a"),
    /already registered/
  );
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);
  const hold = service.addStudentHold(student.id, "financial", ["registration", "transcript"], "Past due balance.");

  assert.throws(
    () => service.registerStudent(student.id, "section_anat101_a"),
    /hold blocking registration/
  );
  service.removeStudentHold(hold.id);
  assert.equal(service.registerStudent(student.id, "section_anat101_a").status, "registered");
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);
  service.registerStudent(student.id, "section_anat101_a");

  const grade = service.submitGrade(student.id, "course_anat101", "sem_fall_2026", 92);
  assert.equal(grade.status, "submitted");
  service.approveGrade(grade.id);

  const updated = service.snapshot().students.find((item) => item.id === student.id);
  assert.equal(updated.gpa, 4);
  assert.equal(updated.earnedCredits, 3);
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);
  const invoice = service.snapshot().invoices[0];
  const payment = service.recordPayment(invoice.id, 2500, "card", "AUTH-1");

  assert.match(payment.receiptNumber, /^RCT-2026-\d{6}$/);
  assert.equal(service.snapshot().invoices[0].status, "paid");
}

{
  const service = new SisService(createInitialState());
  const student = seedAcceptedStudent(service);
  const request = service.createRequest(student.id, "Transcript request", {
    description: "Need an official transcript for scholarship application."
  });

  service.actOnRequest(request.id, "approved", "Approved by registrar.");
  assert.equal(service.snapshot().requests[0].status, "approved");
}

{
  const service = new SisService(createInitialState());
  const report = service.exportReport("system_summary");

  assert.equal(report.reportName, "system_summary");
  assert.ok(report.data.dashboard);
  assert.ok(service.snapshot().auditLogs.some((entry) => entry.action === "report_exported"));
}

console.log("SIS service tests passed.");
