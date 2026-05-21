const nowIso = () => new Date().toISOString();

export const PERMISSIONS = [
  "view_dashboard",
  "manage_users",
  "manage_roles",
  "manage_permissions",
  "manage_students",
  "view_students",
  "create_students",
  "edit_students",
  "delete_students",
  "approve_admissions",
  "reject_admissions",
  "manage_programs",
  "manage_courses",
  "manage_sections",
  "manage_timetable",
  "manage_attendance",
  "submit_grades",
  "approve_grades",
  "view_transcripts",
  "issue_transcripts",
  "manage_fees",
  "manage_payments",
  "manage_invoices",
  "manage_refunds",
  "view_financial_reports",
  "manage_cms",
  "manage_notifications",
  "view_audit_logs",
  "export_reports",
  "manage_settings",
  "access_admin",
  "access_student_portal",
  "access_faculty_portal",
  "access_applicant_portal"
];

export const ROLES = [
  "Super Admin",
  "University President",
  "Chancellor",
  "Vice Chancellor",
  "Registrar",
  "Admissions Officer",
  "Admissions Manager",
  "Student Affairs Officer",
  "Faculty Member",
  "Faculty Dean",
  "Department Head",
  "Academic Advisor",
  "Exam Officer",
  "Finance Officer",
  "Finance Manager",
  "HR Officer",
  "Librarian",
  "IT Administrator",
  "Quality / Accreditation Officer",
  "Student",
  "Applicant",
  "Parent / Guardian",
  "Auditor / Read-only Reviewer"
];

const defaultRolePermissions = () => ({
  "Super Admin": [...PERMISSIONS],
  Registrar: [
    "view_dashboard",
    "access_admin",
    "manage_students",
    "view_students",
    "create_students",
    "edit_students",
    "manage_programs",
    "manage_courses",
    "manage_sections",
    "manage_timetable",
    "view_transcripts",
    "issue_transcripts",
    "export_reports",
    "view_audit_logs"
  ],
  "Admissions Officer": [
    "view_dashboard",
    "access_admin",
    "approve_admissions",
    "reject_admissions",
    "view_students",
    "export_reports"
  ],
  "Finance Officer": [
    "view_dashboard",
    "access_admin",
    "manage_fees",
    "manage_payments",
    "manage_invoices",
    "view_financial_reports"
  ],
  "Faculty Member": [
    "view_dashboard",
    "access_faculty_portal",
    "manage_attendance",
    "submit_grades"
  ],
  Student: [
    "view_dashboard",
    "access_student_portal"
  ],
  Applicant: [
    "view_dashboard",
    "access_applicant_portal"
  ],
  "Auditor / Read-only Reviewer": [
    "view_dashboard",
    "view_students",
    "view_transcripts",
    "view_financial_reports",
    "view_audit_logs"
  ]
});

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

const clone = (value) => JSON.parse(JSON.stringify(value));

export function createInitialState() {
  const academicYear = {
    id: "ay_2026",
    name: "2026-2027",
    startsOn: "2026-08-24",
    endsOn: "2027-06-30",
    status: "open"
  };
  const semester = {
    id: "sem_fall_2026",
    academicYearId: academicYear.id,
    nameEn: "Fall 2026",
    nameAr: "خريف 2026",
    registrationOpen: true,
    addDropOpen: true,
    startsOn: "2026-08-24",
    endsOn: "2026-12-18"
  };

  return {
    meta: {
      appName: "Ain Al Khaleej University SIS",
      version: "1.0.0",
      currentLanguage: "en",
      currentUserId: "user_super_admin"
    },
    settings: {
      universityNameEn: "Ain Al Khaleej University",
      universityNameAr: "جامعة عين الخليج",
      defaultLanguage: "en",
      timezone: "Asia/Dubai",
      registrationOpen: true,
      addDropOpen: true,
      attendanceThreshold: 15,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireNumber: true,
        requireSymbol: true,
        expiryDays: 180
      },
      upload: {
        maxMb: 10,
        allowedExtensions: ["pdf", "jpg", "jpeg", "png", "docx", "xlsx", "glb", "usdz"]
      }
    },
    permissions: PERMISSIONS,
    roles: ROLES.map((name) => ({
      id: uid("role"),
      name,
      protected: name === "Super Admin"
    })),
    rolePermissions: defaultRolePermissions(),
    users: [
      {
        id: "user_super_admin",
        uuid: "00000000-0000-4000-8000-000000000001",
        name: "AKH Super Admin",
        email: "admin@akh-university.local",
        username: "superadmin",
        phone: "+971000000001",
        userType: "staff",
        roles: ["Super Admin"],
        status: "active",
        preferredLanguage: "en",
        mustChangePassword: true,
        emailVerifiedAt: nowIso(),
        lastLoginAt: nowIso()
      },
      {
        id: "user_faculty_1",
        uuid: "00000000-0000-4000-8000-000000000002",
        name: "Dr. Layla Hassan",
        email: "layla.hassan@akh-university.local",
        username: "lhassan",
        phone: "+971000000002",
        userType: "faculty",
        roles: ["Faculty Member"],
        status: "active",
        preferredLanguage: "en"
      }
    ],
    academicYears: [academicYear],
    semesters: [semester],
    colleges: [
      {
        id: "college_health",
        code: "CHS",
        nameEn: "College of Health Sciences",
        nameAr: "كلية العلوم الصحية",
        status: "active"
      }
    ],
    departments: [
      {
        id: "dept_nursing",
        collegeId: "college_health",
        code: "NUR",
        nameEn: "Department of Nursing",
        nameAr: "قسم التمريض",
        status: "active"
      }
    ],
    programs: [
      {
        id: "program_bsn",
        collegeId: "college_health",
        departmentId: "dept_nursing",
        code: "BSN",
        nameEn: "Bachelor of Science in Nursing",
        nameAr: "بكالوريوس العلوم في التمريض",
        degreeLevel: "Bachelor",
        durationYears: 4,
        creditHours: 132,
        tuitionPerCredit: 1250,
        status: "active"
      }
    ],
    courses: [
      {
        id: "course_anat101",
        programId: "program_bsn",
        code: "ANAT101",
        titleEn: "Human Anatomy",
        titleAr: "تشريح الإنسان",
        creditHours: 3,
        prerequisites: [],
        status: "active"
      },
      {
        id: "course_nur201",
        programId: "program_bsn",
        code: "NUR201",
        titleEn: "Foundations of Nursing Practice",
        titleAr: "أساسيات ممارسة التمريض",
        creditHours: 4,
        prerequisites: ["course_anat101"],
        status: "active"
      }
    ],
    campuses: [
      {
        id: "campus_main",
        nameEn: "Main Campus",
        nameAr: "الحرم الرئيسي",
        city: "Al Ain",
        status: "active"
      }
    ],
    buildings: [
      {
        id: "building_academic",
        campusId: "campus_main",
        code: "ACD",
        nameEn: "Academic Building",
        nameAr: "المبنى الأكاديمي"
      }
    ],
    classrooms: [
      {
        id: "room_101",
        buildingId: "building_academic",
        code: "ACD-101",
        nameEn: "Lecture Hall 101",
        nameAr: "قاعة المحاضرات 101",
        capacity: 40
      }
    ],
    sections: [
      {
        id: "section_anat101_a",
        courseId: "course_anat101",
        semesterId: semester.id,
        instructorUserId: "user_faculty_1",
        roomId: "room_101",
        code: "ANAT101-A",
        capacity: 30,
        enrolled: 0,
        meetings: [
          {
            day: "Monday",
            startsAt: "09:00",
            endsAt: "10:30"
          },
          {
            day: "Wednesday",
            startsAt: "09:00",
            endsAt: "10:30"
          }
        ],
        status: "open"
      }
    ],
    applicants: [],
    applications: [],
    admissionDocuments: [],
    offers: [],
    students: [],
    studentDocuments: [],
    studentHolds: [],
    registrations: [],
    attendance: [],
    gradeScales: [
      { letter: "A", min: 90, max: 100, points: 4, pass: true, includedInGpa: true },
      { letter: "B", min: 80, max: 89.99, points: 3, pass: true, includedInGpa: true },
      { letter: "C", min: 70, max: 79.99, points: 2, pass: true, includedInGpa: true },
      { letter: "D", min: 60, max: 69.99, points: 1, pass: true, includedInGpa: true },
      { letter: "F", min: 0, max: 59.99, points: 0, pass: false, includedInGpa: true }
    ],
    grades: [],
    invoices: [],
    payments: [],
    requests: [],
    notifications: [],
    cmsPages: [
      {
        id: "page_home",
        slugEn: "home",
        slugAr: "الرئيسية",
        titleEn: "Ain Al Khaleej University",
        titleAr: "جامعة عين الخليج",
        bodyEn: "A premium bilingual university platform for admissions, academics, finance, and student success.",
        bodyAr: "منصة جامعية ثنائية اللغة للقبول والشؤون الأكاديمية والمالية ونجاح الطلبة.",
        status: "published",
        seo: {
          metaTitleEn: "Ain Al Khaleej University",
          metaTitleAr: "جامعة عين الخليج"
        }
      }
    ],
    announcements: [],
    chatConversations: [],
    mediaFiles: [],
    numberingSequences: {
      applicant: { prefix: "APP", year: 2026, next: 1 },
      student: { prefix: "AKU", year: 2026, next: 1 },
      invoice: { prefix: "INV", year: 2026, next: 1 },
      receipt: { prefix: "RCT", year: 2026, next: 1 },
      request: { prefix: "REQ", year: 2026, next: 1 },
      transcript: { prefix: "TRX", year: 2026, next: 1 }
    },
    auditLogs: [
      {
        id: uid("audit"),
        userId: "user_super_admin",
        action: "system_initialized",
        module: "system",
        recordId: "initial_state",
        oldValues: null,
        newValues: { version: "1.0.0" },
        ipAddress: "127.0.0.1",
        userAgent: "seed",
        createdAt: nowIso()
      }
    ]
  };
}

export class SisService {
  constructor(state = createInitialState()) {
    this.state = state;
  }

  snapshot() {
    return clone(this.state);
  }

  currentUser() {
    return this.state.users.find((user) => user.id === this.state.meta.currentUserId) || this.state.users[0];
  }

  setCurrentUser(userId) {
    const user = this.state.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error("User not found.");
    }
    this.state.meta.currentUserId = user.id;
    user.lastLoginAt = nowIso();
    this.audit("login_success", "auth", user.id, null, { userId: user.id });
    return user;
  }

  userPermissions(user = this.currentUser()) {
    return [...new Set(user.roles.flatMap((role) => this.state.rolePermissions[role] || []))];
  }

  can(permission, user = this.currentUser()) {
    return this.userPermissions(user).includes(permission);
  }

  assertPermission(permission) {
    if (!this.can(permission)) {
      this.audit("suspicious_access_attempt", "security", permission, null, { permission });
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  audit(action, module, recordId, oldValues = null, newValues = null) {
    const entry = {
      id: uid("audit"),
      userId: this.currentUser()?.id || null,
      action,
      module,
      recordId,
      oldValues,
      newValues,
      ipAddress: "127.0.0.1",
      userAgent: "browser-or-test",
      createdAt: nowIso()
    };
    this.state.auditLogs.unshift(entry);
    return entry;
  }

  generateNumber(sequenceName) {
    const sequence = this.state.numberingSequences[sequenceName];
    if (!sequence) {
      throw new Error(`Unknown numbering sequence: ${sequenceName}`);
    }
    const value = `${sequence.prefix}-${sequence.year}-${String(sequence.next).padStart(6, "0")}`;
    sequence.next += 1;
    this.audit("number_generated", "numbering", sequenceName, null, { value });
    return value;
  }

  createApplicant(payload) {
    const required = ["firstNameEn", "lastNameEn", "email", "programId"];
    for (const field of required) {
      if (!payload[field]) {
        throw new Error(`Missing applicant field: ${field}`);
      }
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      throw new Error("Applicant email is invalid.");
    }
    if (!this.state.programs.some((program) => program.id === payload.programId && program.status === "active")) {
      throw new Error("Selected program is not available.");
    }

    const existingApplicant = this.state.applicants.find((applicant) => applicant.email === payload.email);
    const applicant = existingApplicant || {
      id: uid("applicant"),
      applicantNumber: this.generateNumber("applicant"),
      firstNameEn: payload.firstNameEn,
      lastNameEn: payload.lastNameEn,
      firstNameAr: payload.firstNameAr || "",
      lastNameAr: payload.lastNameAr || "",
      email: payload.email,
      phone: payload.phone || "",
      nationality: payload.nationality || "",
      emiratesId: payload.emiratesId || "",
      passportNumber: payload.passportNumber || "",
      status: "active",
      createdAt: nowIso()
    };

    if (!existingApplicant) {
      this.state.applicants.push(applicant);
    }

    const application = {
      id: uid("application"),
      applicantId: applicant.id,
      programId: payload.programId,
      semesterId: payload.semesterId || this.state.semesters[0]?.id,
      status: "submitted",
      guardian: payload.guardian || {},
      documents: payload.documents || [],
      notes: payload.notes || "",
      submittedAt: nowIso(),
      statusHistory: [
        {
          status: "submitted",
          changedAt: nowIso(),
          changedBy: this.currentUser()?.id || null
        }
      ]
    };
    this.state.applications.push(application);
    this.notify(applicant.email, "application_submitted", {
      applicationId: application.id,
      applicantNumber: applicant.applicantNumber
    });
    this.audit("application_submitted", "admissions", application.id, null, application);
    return application;
  }

  changeApplicationStatus(applicationId, status, note = "") {
    const application = this.findById(this.state.applications, applicationId, "Application");
    const old = clone(application);
    application.status = status;
    application.statusHistory.push({
      status,
      note,
      changedAt: nowIso(),
      changedBy: this.currentUser()?.id || null
    });
    this.audit("application_status_changed", "admissions", application.id, old, application);
    return application;
  }

  approveApplication(applicationId, note = "") {
    this.assertPermission("approve_admissions");
    return this.changeApplicationStatus(applicationId, "eligible", note);
  }

  rejectApplication(applicationId, note = "") {
    this.assertPermission("reject_admissions");
    return this.changeApplicationStatus(applicationId, "rejected", note);
  }

  issueOffer(applicationId, expiresOn) {
    this.assertPermission("approve_admissions");
    const application = this.changeApplicationStatus(applicationId, "offer_sent", "Offer issued");
    const offer = {
      id: uid("offer"),
      applicationId,
      offerNumber: `OFR-${applicationId.slice(-8).toUpperCase()}`,
      status: "sent",
      expiresOn,
      issuedAt: nowIso()
    };
    this.state.offers.push(offer);
    this.audit("offer_issued", "admissions", offer.id, null, offer);
    return offer;
  }

  acceptOffer(applicationId) {
    const offer = this.state.offers.find((item) => item.applicationId === applicationId);
    if (!offer) {
      throw new Error("Offer not found.");
    }
    const old = clone(offer);
    offer.status = "accepted";
    offer.acceptedAt = nowIso();
    this.changeApplicationStatus(applicationId, "offer_accepted", "Applicant accepted offer");
    this.audit("offer_accepted", "admissions", offer.id, old, offer);
    return offer;
  }

  convertApplicationToStudent(applicationId) {
    this.assertPermission("create_students");
    const application = this.findById(this.state.applications, applicationId, "Application");
    if (application.status !== "offer_accepted" && application.status !== "eligible") {
      throw new Error("Only eligible or offer-accepted applications can be converted.");
    }
    const applicant = this.findById(this.state.applicants, application.applicantId, "Applicant");
    const existingStudent = this.state.students.find((student) => student.applicationId === application.id);
    if (existingStudent) {
      return existingStudent;
    }

    const user = {
      id: uid("user"),
      uuid: cryptoSafeUuid(),
      name: `${applicant.firstNameEn} ${applicant.lastNameEn}`.trim(),
      email: applicant.email,
      username: applicant.applicantNumber.toLowerCase(),
      phone: applicant.phone,
      userType: "student",
      roles: ["Student"],
      status: "active",
      preferredLanguage: "en",
      mustChangePassword: true,
      createdAt: nowIso()
    };
    const student = {
      id: uid("student"),
      studentNumber: this.generateNumber("student"),
      userId: user.id,
      applicantId: applicant.id,
      applicationId: application.id,
      programId: application.programId,
      semesterId: application.semesterId,
      firstNameEn: applicant.firstNameEn,
      lastNameEn: applicant.lastNameEn,
      firstNameAr: applicant.firstNameAr,
      lastNameAr: applicant.lastNameAr,
      academicStatus: "active",
      financialStatus: "clear",
      admissionDate: nowIso().slice(0, 10),
      gpa: 0,
      earnedCredits: 0,
      createdAt: nowIso()
    };

    this.state.users.push(user);
    this.state.students.push(student);
    application.status = "converted_to_student";
    application.statusHistory.push({
      status: "converted_to_student",
      changedAt: nowIso(),
      changedBy: this.currentUser()?.id || null
    });
    this.createInvoice(student.id, "Initial registration and tuition deposit", 2500);
    this.notify(user.id, "student_created", { studentNumber: student.studentNumber });
    this.audit("applicant_converted_to_student", "students", student.id, null, {
      student,
      userId: user.id,
      applicationId
    });
    return student;
  }

  addStudentHold(studentId, holdType, blocks = ["registration"], note = "") {
    this.assertPermission("edit_students");
    const student = this.findById(this.state.students, studentId, "Student");
    const hold = {
      id: uid("hold"),
      studentId,
      holdType,
      blocks,
      note,
      status: "active",
      createdAt: nowIso()
    };
    this.state.studentHolds.push(hold);
    if (holdType === "financial") {
      student.financialStatus = "financially_blocked";
    }
    this.audit("student_hold_added", "students", hold.id, null, hold);
    return hold;
  }

  removeStudentHold(holdId) {
    this.assertPermission("edit_students");
    const hold = this.findById(this.state.studentHolds, holdId, "Hold");
    const old = clone(hold);
    hold.status = "released";
    hold.releasedAt = nowIso();
    const activeFinancialHold = this.state.studentHolds.some(
      (item) => item.studentId === hold.studentId && item.holdType === "financial" && item.status === "active"
    );
    if (!activeFinancialHold) {
      const student = this.state.students.find((item) => item.id === hold.studentId);
      if (student) {
        student.financialStatus = "clear";
      }
    }
    this.audit("student_hold_released", "students", hold.id, old, hold);
    return hold;
  }

  registerStudent(studentId, sectionId, options = {}) {
    const student = this.findById(this.state.students, studentId, "Student");
    const section = this.findById(this.state.sections, sectionId, "Section");
    const course = this.findById(this.state.courses, section.courseId, "Course");
    const semester = this.findById(this.state.semesters, section.semesterId, "Semester");
    const errors = [];

    if (student.academicStatus !== "active") errors.push("Student is not active.");
    if (!semester.registrationOpen && !options.override) errors.push("Registration period is closed.");
    if (this.state.studentHolds.some((hold) => hold.studentId === studentId && hold.status === "active" && hold.blocks.includes("registration"))) {
      errors.push("Student has a hold blocking registration.");
    }
    if (section.status !== "open") errors.push("Section is not open.");
    if (section.enrolled >= section.capacity && !options.override) errors.push("Section capacity is full.");
    if (this.state.registrations.some((item) => item.studentId === studentId && item.sectionId === sectionId && item.status === "registered")) {
      errors.push("Student is already registered in this section.");
    }
    const passedCourseIds = this.state.grades
      .filter((grade) => grade.studentId === studentId && grade.status === "approved" && grade.pass)
      .map((grade) => grade.courseId);
    for (const prerequisiteId of course.prerequisites) {
      if (!passedCourseIds.includes(prerequisiteId) && !options.override) {
        errors.push(`Missing prerequisite: ${prerequisiteId}`);
      }
    }
    if (this.hasTimetableConflict(studentId, section) && !options.override) {
      errors.push("Timetable conflict detected.");
    }

    if (errors.length > 0) {
      const failure = {
        studentId,
        sectionId,
        errors,
        createdAt: nowIso()
      };
      this.audit("registration_rejected", "registration", sectionId, null, failure);
      throw new Error(errors.join(" "));
    }

    const registration = {
      id: uid("registration"),
      studentId,
      sectionId,
      courseId: course.id,
      semesterId: section.semesterId,
      status: "registered",
      override: Boolean(options.override),
      registeredAt: nowIso()
    };
    section.enrolled += 1;
    this.state.registrations.push(registration);
    this.notify(student.userId, "registration_successful", {
      courseCode: course.code,
      sectionCode: section.code
    });
    this.audit("student_registered", "registration", registration.id, null, registration);
    return registration;
  }

  dropRegistration(registrationId, reason = "") {
    const registration = this.findById(this.state.registrations, registrationId, "Registration");
    const old = clone(registration);
    registration.status = "dropped";
    registration.dropReason = reason;
    registration.droppedAt = nowIso();
    const section = this.state.sections.find((item) => item.id === registration.sectionId);
    if (section && section.enrolled > 0) {
      section.enrolled -= 1;
    }
    this.audit("registration_dropped", "registration", registration.id, old, registration);
    return registration;
  }

  hasTimetableConflict(studentId, targetSection) {
    const activeSections = this.state.registrations
      .filter((registration) => registration.studentId === studentId && registration.status === "registered")
      .map((registration) => this.state.sections.find((section) => section.id === registration.sectionId))
      .filter(Boolean);
    return activeSections.some((section) =>
      section.meetings.some((meeting) =>
        targetSection.meetings.some((target) =>
          meeting.day === target.day &&
          meeting.startsAt < target.endsAt &&
          target.startsAt < meeting.endsAt
        )
      )
    );
  }

  markAttendance(sectionId, meetingDate, records, status = "submitted") {
    this.assertPermission("manage_attendance");
    const section = this.findById(this.state.sections, sectionId, "Section");
    const activeStudentIds = this.state.registrations
      .filter((registration) => registration.sectionId === section.id && registration.status === "registered")
      .map((registration) => registration.studentId);
    const invalid = records.filter((record) => !activeStudentIds.includes(record.studentId));
    if (invalid.length > 0) {
      throw new Error("Attendance contains students not registered in the section.");
    }
    const session = {
      id: uid("attendance"),
      sectionId,
      meetingDate,
      status,
      records: records.map((record) => ({
        ...record,
        status: record.status || "present"
      })),
      submittedBy: this.currentUser()?.id || null,
      submittedAt: nowIso()
    };
    this.state.attendance.push(session);
    this.audit("attendance_submitted", "attendance", session.id, null, session);
    return session;
  }

  submitGrade(studentId, courseId, semesterId, percentage) {
    this.assertPermission("submit_grades");
    if (percentage < 0 || percentage > 100) {
      throw new Error("Grade percentage must be between 0 and 100.");
    }
    const gradeScale = this.state.gradeScales.find((item) => percentage >= item.min && percentage <= item.max);
    if (!gradeScale) {
      throw new Error("No grade scale matches the percentage.");
    }
    const existing = this.state.grades.find(
      (grade) => grade.studentId === studentId && grade.courseId === courseId && grade.semesterId === semesterId
    );
    const grade = existing || {
      id: uid("grade"),
      studentId,
      courseId,
      semesterId,
      history: []
    };
    const old = existing ? clone(existing) : null;
    grade.percentage = percentage;
    grade.letter = gradeScale.letter;
    grade.points = gradeScale.points;
    grade.pass = gradeScale.pass;
    grade.includedInGpa = gradeScale.includedInGpa;
    grade.status = "submitted";
    grade.submittedAt = nowIso();
    grade.submittedBy = this.currentUser()?.id || null;
    grade.history.push({
      action: "submitted",
      percentage,
      letter: grade.letter,
      changedAt: nowIso()
    });
    if (!existing) {
      this.state.grades.push(grade);
    }
    this.audit("grade_submitted", "grades", grade.id, old, grade);
    return grade;
  }

  approveGrade(gradeId) {
    this.assertPermission("approve_grades");
    const grade = this.findById(this.state.grades, gradeId, "Grade");
    const old = clone(grade);
    grade.status = "approved";
    grade.approvedAt = nowIso();
    grade.approvedBy = this.currentUser()?.id || null;
    grade.history.push({
      action: "approved",
      changedAt: nowIso(),
      changedBy: this.currentUser()?.id || null
    });
    const student = this.findById(this.state.students, grade.studentId, "Student");
    const gpa = this.calculateGpa(student.id);
    student.gpa = gpa.cumulativeGpa;
    student.earnedCredits = gpa.earnedCredits;
    this.notify(student.userId, "grade_published", {
      courseId: grade.courseId,
      letter: grade.letter
    });
    this.audit("grade_approved", "grades", grade.id, old, grade);
    return grade;
  }

  calculateGpa(studentId) {
    const approvedGrades = this.state.grades.filter(
      (grade) => grade.studentId === studentId && grade.status === "approved" && grade.includedInGpa
    );
    let attemptedCredits = 0;
    let earnedCredits = 0;
    let qualityPoints = 0;
    for (const grade of approvedGrades) {
      const course = this.findById(this.state.courses, grade.courseId, "Course");
      attemptedCredits += course.creditHours;
      if (grade.pass) {
        earnedCredits += course.creditHours;
      }
      qualityPoints += grade.points * course.creditHours;
    }
    return {
      attemptedCredits,
      earnedCredits,
      qualityPoints,
      cumulativeGpa: attemptedCredits === 0 ? 0 : Number((qualityPoints / attemptedCredits).toFixed(2))
    };
  }

  issueTranscript(studentId, official = false) {
    this.assertPermission("issue_transcripts");
    const student = this.findById(this.state.students, studentId, "Student");
    if (official && this.state.studentHolds.some((hold) => hold.studentId === studentId && hold.status === "active" && hold.blocks.includes("transcript"))) {
      throw new Error("Official transcript blocked by active hold.");
    }
    const transcript = {
      id: uid("transcript"),
      verificationCode: this.generateNumber("transcript"),
      studentId,
      official,
      status: "valid",
      gpa: this.calculateGpa(studentId),
      grades: this.state.grades.filter((grade) => grade.studentId === studentId && grade.status === "approved"),
      issuedAt: nowIso()
    };
    this.audit("transcript_issued", "transcripts", transcript.id, null, transcript);
    return transcript;
  }

  createInvoice(studentId, description, amount) {
    if (amount <= 0) {
      throw new Error("Invoice amount must be positive.");
    }
    const invoice = {
      id: uid("invoice"),
      invoiceNumber: this.generateNumber("invoice"),
      studentId,
      description,
      amount,
      paidAmount: 0,
      balance: amount,
      status: "unpaid",
      issuedAt: nowIso()
    };
    this.state.invoices.push(invoice);
    this.notify(studentId, "invoice_generated", {
      invoiceNumber: invoice.invoiceNumber,
      amount
    });
    this.audit("invoice_created", "finance", invoice.id, null, invoice);
    return invoice;
  }

  recordPayment(invoiceId, amount, method = "cash", reference = "") {
    this.assertPermission("manage_payments");
    const invoice = this.findById(this.state.invoices, invoiceId, "Invoice");
    if (amount <= 0 || amount > invoice.balance) {
      throw new Error("Payment amount must be positive and not exceed invoice balance.");
    }
    const oldInvoice = clone(invoice);
    const payment = {
      id: uid("payment"),
      receiptNumber: this.generateNumber("receipt"),
      invoiceId,
      studentId: invoice.studentId,
      amount,
      method,
      reference,
      status: "posted",
      paidAt: nowIso()
    };
    invoice.paidAmount += amount;
    invoice.balance -= amount;
    invoice.status = invoice.balance === 0 ? "paid" : "partially_paid";
    this.state.payments.push(payment);
    this.audit("payment_recorded", "finance", payment.id, oldInvoice, { invoice, payment });
    return payment;
  }

  createRequest(studentId, type, payload = {}) {
    const request = {
      id: uid("request"),
      requestNumber: this.generateNumber("request"),
      studentId,
      type,
      title: payload.title || type,
      description: payload.description || "",
      status: "submitted",
      approvals: [],
      attachments: payload.attachments || [],
      createdAt: nowIso()
    };
    this.state.requests.push(request);
    this.audit("request_submitted", "requests", request.id, null, request);
    return request;
  }

  actOnRequest(requestId, action, comment = "") {
    const request = this.findById(this.state.requests, requestId, "Request");
    const old = clone(request);
    if (!["under_review", "approved", "rejected", "cancelled", "completed", "pending_student_action"].includes(action)) {
      throw new Error("Invalid request action.");
    }
    request.status = action;
    request.approvals.push({
      action,
      comment,
      userId: this.currentUser()?.id || null,
      createdAt: nowIso()
    });
    this.audit("request_status_changed", "requests", request.id, old, request);
    return request;
  }

  publishCmsPage(pageId, updates) {
    this.assertPermission("manage_cms");
    const page = this.findById(this.state.cmsPages, pageId, "CMS page");
    const old = clone(page);
    Object.assign(page, updates, {
      status: updates.status || page.status,
      updatedAt: nowIso(),
      updatedBy: this.currentUser()?.id || null
    });
    this.audit("cms_page_updated", "cms", page.id, old, page);
    return page;
  }

  notify(recipient, template, payload = {}) {
    const notification = {
      id: uid("notification"),
      recipient,
      template,
      payload,
      channels: ["in_app", "email"],
      status: "queued",
      createdAt: nowIso()
    };
    this.state.notifications.unshift(notification);
    return notification;
  }

  createChatConversation(visitorName, language = "en", message = "") {
    const conversation = {
      id: uid("chat"),
      visitorName,
      language,
      status: "pending",
      messages: message
        ? [
            {
              sender: "visitor",
              message,
              createdAt: nowIso()
            }
          ]
        : [],
      createdAt: nowIso()
    };
    this.state.chatConversations.unshift(conversation);
    this.audit("live_chat_requested", "chat", conversation.id, null, conversation);
    return conversation;
  }

  registerMediaFile(payload) {
    this.assertPermission("manage_cms");
    const required = ["folder", "originalName", "mimeType", "extension", "sizeBytes", "checksum"];
    for (const field of required) {
      if (!payload[field]) {
        throw new Error(`Missing media field: ${field}`);
      }
    }

    const extension = String(payload.extension).toLowerCase().replace(/^\./, "");
    const allowedExtensions = this.state.settings.upload.allowedExtensions;
    const maxBytes = this.state.settings.upload.maxMb * 1024 * 1024;
    const executableExtensions = ["php", "phtml", "js", "mjs", "sh", "bat", "cmd", "exe", "com"];

    if (!allowedExtensions.includes(extension) || executableExtensions.includes(extension)) {
      throw new Error("File extension is not allowed.");
    }
    if (Number(payload.sizeBytes) <= 0 || Number(payload.sizeBytes) > maxBytes) {
      throw new Error(`File size must be between 1 byte and ${this.state.settings.upload.maxMb} MB.`);
    }
    if (!/^[a-f0-9]{64}$/i.test(payload.checksum)) {
      throw new Error("Checksum must be a SHA-256 hex digest.");
    }

    const media = {
      id: uid("media"),
      disk: payload.disk || "private",
      folder: payload.folder,
      originalName: payload.originalName,
      storedName: `${uid("file")}.${extension}`,
      mimeType: payload.mimeType,
      extension,
      sizeBytes: Number(payload.sizeBytes),
      checksum: payload.checksum.toLowerCase(),
      visibility: payload.visibility || "private",
      uploadedBy: this.currentUser()?.id || null,
      createdAt: nowIso()
    };
    if (!this.state.mediaFiles) {
      this.state.mediaFiles = [];
    }
    this.state.mediaFiles.unshift(media);
    this.audit("media_file_registered", "files", media.id, null, media);
    return media;
  }

  processNotifications(limit = 25) {
    this.assertPermission("manage_notifications");
    const queued = this.state.notifications
      .filter((notification) => notification.status === "queued")
      .slice(0, Math.max(1, Math.min(Number(limit) || 25, 100)));
    for (const notification of queued) {
      notification.status = "sent";
      notification.sentAt = nowIso();
    }
    this.audit("notifications_processed", "notifications", "batch", null, {
      count: queued.length
    });
    return queued;
  }

  buildDashboard() {
    const outstanding = this.state.invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    return {
      applications: this.countBy(this.state.applications, "status"),
      students: this.countBy(this.state.students, "academicStatus"),
      registrations: this.countBy(this.state.registrations, "status"),
      invoices: this.countBy(this.state.invoices, "status"),
      outstanding,
      pendingRequests: this.state.requests.filter((request) => !["approved", "rejected", "completed", "cancelled"].includes(request.status)).length,
      unreadNotifications: this.state.notifications.filter((notification) => notification.status !== "read").length,
      auditEvents: this.state.auditLogs.length
    };
  }

  exportReport(reportName) {
    this.assertPermission("export_reports");
    const payload = {
      reportName,
      generatedAt: nowIso(),
      data: {
        dashboard: this.buildDashboard(),
        applications: this.state.applications,
        students: this.state.students,
        registrations: this.state.registrations,
        invoices: this.state.invoices,
        auditLogs: this.state.auditLogs.slice(0, 50)
      }
    };
    this.audit("report_exported", "reports", reportName, null, { records: Object.keys(payload.data) });
    return payload;
  }

  countBy(items, field) {
    return items.reduce((result, item) => {
      const key = item[field] || "unknown";
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
  }

  findById(collection, id, label) {
    const record = collection.find((item) => item.id === id);
    if (!record) {
      throw new Error(`${label} not found.`);
    }
    return record;
  }
}

function cryptoSafeUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = Math.random() * 16 | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}
