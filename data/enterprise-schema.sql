-- Ain Al Khaleej University SIS enterprise schema baseline.
-- Target engine: MySQL 8.0+ / InnoDB / utf8mb4_unicode_ci.

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  username VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMP NULL,
  phone_verified_at TIMESTAMP NULL,
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(64) NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'en',
  profile_photo_path VARCHAR(255) NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  deleted_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  INDEX idx_users_type_status (user_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  protected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  module VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_permissions_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_user (
  role_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  PRIMARY KEY (role_id, user_id),
  CONSTRAINT fk_role_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_role_user_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permission_role (
  permission_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  PRIMARY KEY (permission_id, role_id),
  CONSTRAINT fk_permission_role_permission FOREIGN KEY (permission_id) REFERENCES permissions(id),
  CONSTRAINT fk_permission_role_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(80) NOT NULL,
  table_name VARCHAR(120) NULL,
  record_id VARCHAR(120) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_module_created (module, created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(150) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  email VARCHAR(190) NULL,
  status VARCHAR(40) NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_years (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE semesters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  academic_year_id BIGINT UNSIGNED NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  name_ar VARCHAR(120) NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  registration_starts_at DATETIME NULL,
  registration_ends_at DATETIME NULL,
  add_drop_ends_at DATETIME NULL,
  withdrawal_deadline DATE NULL,
  grading_deadline DATE NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_semester_year_status (academic_year_id, status),
  CONSTRAINT fk_semester_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE colleges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_department_college (college_id),
  CONSTRAINT fk_department_college FOREIGN KEY (college_id) REFERENCES colleges(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  degree_level VARCHAR(80) NOT NULL,
  duration_years DECIMAL(4,1) NOT NULL,
  credit_hours SMALLINT UNSIGNED NOT NULL,
  tuition_per_credit DECIMAL(12,2) NOT NULL DEFAULT 0,
  admission_requirements JSON NULL,
  career_opportunities JSON NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_program_department_status (department_id, status),
  CONSTRAINT fk_program_college FOREIGN KEY (college_id) REFERENCES colleges(id),
  CONSTRAINT fk_program_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id BIGINT UNSIGNED NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  title_en VARCHAR(190) NOT NULL,
  title_ar VARCHAR(190) NOT NULL,
  description_en TEXT NULL,
  description_ar TEXT NULL,
  credit_hours DECIMAL(4,1) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_courses_program_status (program_id, status),
  CONSTRAINT fk_course_program FOREIGN KEY (program_id) REFERENCES programs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_prerequisites (
  course_id BIGINT UNSIGNED NOT NULL,
  prerequisite_course_id BIGINT UNSIGNED NOT NULL,
  minimum_grade VARCHAR(10) NULL,
  PRIMARY KEY (course_id, prerequisite_course_id),
  CONSTRAINT fk_prereq_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_prereq_required FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE campuses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  city VARCHAR(120) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE buildings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campus_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_building_campus_code (campus_id, code),
  CONSTRAINT fk_building_campus FOREIGN KEY (campus_id) REFERENCES campuses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classrooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  building_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name_en VARCHAR(190) NOT NULL,
  name_ar VARCHAR(190) NOT NULL,
  capacity SMALLINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_room_building_code (building_id, code),
  CONSTRAINT fk_room_building FOREIGN KEY (building_id) REFERENCES buildings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_sections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  instructor_user_id BIGINT UNSIGNED NULL,
  room_id BIGINT UNSIGNED NULL,
  code VARCHAR(60) NOT NULL,
  capacity SMALLINT UNSIGNED NOT NULL,
  enrolled SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_section_semester_code (semester_id, code),
  INDEX idx_sections_course_semester (course_id, semester_id),
  CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_section_semester FOREIGN KEY (semester_id) REFERENCES semesters(id),
  CONSTRAINT fk_section_instructor FOREIGN KEY (instructor_user_id) REFERENCES users(id),
  CONSTRAINT fk_section_room FOREIGN KEY (room_id) REFERENCES classrooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE section_meetings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id BIGINT UNSIGNED NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_meeting_section_day (section_id, day_of_week),
  CONSTRAINT fk_meeting_section FOREIGN KEY (section_id) REFERENCES course_sections(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applicants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  applicant_number VARCHAR(40) NOT NULL UNIQUE,
  first_name_en VARCHAR(120) NOT NULL,
  last_name_en VARCHAR(120) NOT NULL,
  first_name_ar VARCHAR(120) NULL,
  last_name_ar VARCHAR(120) NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(40) NULL,
  nationality VARCHAR(120) NULL,
  emirates_id VARCHAR(40) NULL,
  passport_number VARCHAR(80) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_applicants_email (email),
  CONSTRAINT fk_applicant_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  applicant_id BIGINT UNSIGNED NOT NULL,
  program_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  guardian_json JSON NULL,
  submitted_at TIMESTAMP NULL,
  decided_at TIMESTAMP NULL,
  converted_student_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_applications_status (status),
  INDEX idx_applications_program_status (program_id, status),
  CONSTRAINT fk_application_applicant FOREIGN KEY (applicant_id) REFERENCES applicants(id),
  CONSTRAINT fk_application_program FOREIGN KEY (program_id) REFERENCES programs(id),
  CONSTRAINT fk_application_semester FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE application_documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  document_type VARCHAR(120) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  verification_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  verified_by BIGINT UNSIGNED NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_application_document_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admission_status_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL,
  note TEXT NULL,
  changed_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admission_history_application (application_id),
  CONSTRAINT fk_admission_history_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admission_offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  offer_number VARCHAR(60) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'sent',
  expires_on DATE NULL,
  accepted_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_offer_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  applicant_id BIGINT UNSIGNED NULL,
  application_id BIGINT UNSIGNED NULL,
  student_number VARCHAR(40) NOT NULL UNIQUE,
  program_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  first_name_en VARCHAR(120) NOT NULL,
  last_name_en VARCHAR(120) NOT NULL,
  first_name_ar VARCHAR(120) NULL,
  last_name_ar VARCHAR(120) NULL,
  academic_status VARCHAR(40) NOT NULL DEFAULT 'active',
  financial_status VARCHAR(40) NOT NULL DEFAULT 'clear',
  admission_date DATE NOT NULL,
  gpa DECIMAL(4,2) NOT NULL DEFAULT 0,
  earned_credits DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  INDEX idx_students_program (program_id),
  INDEX idx_students_user (user_id),
  CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_student_program FOREIGN KEY (program_id) REFERENCES programs(id),
  CONSTRAINT fk_student_semester FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_holds (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  hold_type VARCHAR(80) NOT NULL,
  blocks JSON NOT NULL,
  note TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_by BIGINT UNSIGNED NULL,
  released_by BIGINT UNSIGNED NULL,
  released_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_student_holds_student_status (student_id, status),
  CONSTRAINT fk_hold_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'registered',
  override_reason TEXT NULL,
  registered_at TIMESTAMP NULL,
  dropped_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_active_registration (student_id, section_id, status),
  INDEX idx_registrations_student (student_id),
  INDEX idx_registrations_semester (semester_id),
  CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_registration_semester FOREIGN KEY (semester_id) REFERENCES semesters(id),
  CONSTRAINT fk_registration_section FOREIGN KEY (section_id) REFERENCES course_sections(id),
  CONSTRAINT fk_registration_course FOREIGN KEY (course_id) REFERENCES courses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE class_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id BIGINT UNSIGNED NOT NULL,
  session_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  submitted_by BIGINT UNSIGNED NULL,
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_class_session_date (section_id, session_date),
  CONSTRAINT fk_session_section FOREIGN KEY (section_id) REFERENCES course_sections(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  class_session_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'present',
  comments TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_attendance_student_session (class_session_id, student_id),
  INDEX idx_attendance_student (student_id),
  INDEX idx_attendance_section (section_id),
  CONSTRAINT fk_attendance_session FOREIGN KEY (class_session_id) REFERENCES class_sessions(id),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grade_scales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  letter_grade VARCHAR(10) NOT NULL UNIQUE,
  min_percentage DECIMAL(5,2) NOT NULL,
  max_percentage DECIMAL(5,2) NOT NULL,
  grade_points DECIMAL(4,2) NOT NULL,
  pass_flag BOOLEAN NOT NULL DEFAULT TRUE,
  included_in_gpa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_grades (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  letter_grade VARCHAR(10) NOT NULL,
  grade_points DECIMAL(4,2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'submitted',
  submitted_by BIGINT UNSIGNED NULL,
  approved_by BIGINT UNSIGNED NULL,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  UNIQUE KEY uq_grade_student_course_semester (student_id, course_id, semester_id),
  INDEX idx_student_grades_student (student_id),
  CONSTRAINT fk_grade_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_grade_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_grade_semester FOREIGN KEY (semester_id) REFERENCES semesters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  invoice_number VARCHAR(40) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'unpaid',
  due_on DATE NULL,
  issued_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_invoices_student (student_id),
  CONSTRAINT fk_invoice_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  receipt_number VARCHAR(40) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  method VARCHAR(40) NOT NULL,
  reference VARCHAR(190) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'posted',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_payments_student (student_id),
  CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transcript_issues (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  verification_code VARCHAR(60) NOT NULL UNIQUE,
  official BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'valid',
  payload JSON NOT NULL,
  issued_by BIGINT UNSIGNED NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transcript_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  request_number VARCHAR(40) NOT NULL UNIQUE,
  request_type VARCHAR(120) NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'submitted',
  payload JSON NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_requests_student_status (student_id, status),
  CONSTRAINT fk_request_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  recipient VARCHAR(190) NULL,
  template_key VARCHAR(120) NOT NULL,
  payload JSON NULL,
  channels JSON NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_notifications_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cms_pages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug_en VARCHAR(190) NOT NULL UNIQUE,
  slug_ar VARCHAR(190) NOT NULL,
  title_en VARCHAR(190) NOT NULL,
  title_ar VARCHAR(190) NOT NULL,
  body_en LONGTEXT NULL,
  body_ar LONGTEXT NULL,
  meta_title_en VARCHAR(190) NULL,
  meta_title_ar VARCHAR(190) NULL,
  meta_description_en TEXT NULL,
  meta_description_ar TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  publish_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media_files (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  disk VARCHAR(40) NOT NULL DEFAULT 'private',
  folder VARCHAR(120) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  checksum VARCHAR(128) NOT NULL,
  visibility VARCHAR(40) NOT NULL DEFAULT 'private',
  uploaded_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_media_folder (folder),
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_conversations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  visitor_name VARCHAR(190) NULL,
  language VARCHAR(5) NOT NULL DEFAULT 'en',
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  assigned_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_type VARCHAR(40) NOT NULL,
  sender_user_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_message_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE numbering_sequences (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sequence_key VARCHAR(80) NOT NULL UNIQUE,
  prefix VARCHAR(20) NOT NULL,
  sequence_year SMALLINT UNSIGNED NOT NULL,
  next_value BIGINT UNSIGNED NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Flexible module tables for remaining enterprise areas. Each table stores bilingual
-- labels, controlled status, JSON configuration, audit fields, and can be expanded
-- into stricter module-specific migrations during Laravel implementation.
CREATE TABLE enterprise_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  module VARCHAR(80) NOT NULL,
  record_type VARCHAR(120) NOT NULL,
  owner_user_id BIGINT UNSIGNED NULL,
  owner_student_id BIGINT UNSIGNED NULL,
  title_en VARCHAR(190) NOT NULL,
  title_ar VARCHAR(190) NOT NULL,
  payload JSON NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  INDEX idx_enterprise_module_type_status (module, record_type, status),
  INDEX idx_enterprise_student (owner_student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- enterprise_records module values cover:
-- curriculum_plans, study_plans, holidays, timetable_slots, application_fees,
-- student_guardians, student_contacts, student_addresses, student_documents,
-- student_notes, add_drop_requests, section_waitlists, attendance_warnings,
-- assessment_schemes, exam_schedules, grade_change_requests, gpa_calculations,
-- transcript_requests, fee_structures, scholarships, refunds, advisor_assignments,
-- advising_notes, faculty_profiles, library_books, library_borrowings, employees,
-- reports, import_batches, export_logs, workflows, announcements, ar_assets,
-- campus_visit_requests, quality_kpis, lms_courses, backup_logs, maintenance_logs.
