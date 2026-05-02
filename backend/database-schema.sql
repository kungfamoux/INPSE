-- Nigerian School Management System Database Schema
-- Created for Fine Edu Sphere Link

-- Users Table (Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'accountant', 'proprietor')),
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Academic Sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "2024/2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Terms
CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    name VARCHAR(50) NOT NULL, -- e.g., "First Term", "Second Term", "Third Term"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Nursery 1 Yellow", "Primary 3"
    level VARCHAR(50) NOT NULL, -- e.g., "Creche", "Nursery 1", "Nursery 2", "Nursery 3", "Primary"
    color VARCHAR(20), -- e.g., "Yellow", "Blue", "Green" (for nursery classes)
    capacity INTEGER DEFAULT 30,
    teacher_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Mathematics", "English", "Science"
    code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Class Subjects (Many-to-Many)
CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    class_id INTEGER REFERENCES classes(id),
    parent_id INTEGER REFERENCES users(id),
    photo_url VARCHAR(500),
    address TEXT,
    emergency_contact VARCHAR(20),
    medical_conditions TEXT,
    admission_date DATE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_no VARCHAR(50) UNIQUE,
    qualification VARCHAR(200),
    specialization VARCHAR(200),
    hire_date DATE,
    salary DECIMAL(10,2),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fee Structures
CREATE TABLE fee_structures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Primary 3 Fees", "Nursery Fees"
    class_level VARCHAR(50) NOT NULL, -- e.g., "Creche", "Nursery", "Primary 1", "Primary 2", etc.
    tuition_fee DECIMAL(10,2) NOT NULL,
    pta_levy DECIMAL(10,2) DEFAULT 0,
    bus_fee DECIMAL(10,2) DEFAULT 0,
    uniform_fee DECIMAL(10,2) DEFAULT 0,
    books_fee DECIMAL(10,2) DEFAULT 0,
    feeding_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        tuition_fee + pta_levy + bus_fee + uniform_fee + books_fee + feeding_fee
    ) STORED,
    session_id INTEGER REFERENCES sessions(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fee Invoices
CREATE TABLE fee_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES students(id),
    fee_structure_id INTEGER REFERENCES fee_structures(id),
    term_id INTEGER REFERENCES terms(id),
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES fee_invoices(id),
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'bank_transfer', 'paystack', 'flutterwave')),
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(200), -- For online payments
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE DEFAULT NOW(),
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    class_id INTEGER REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')),
    reason TEXT,
    marked_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Score Templates
CREATE TABLE score_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Primary 3 Score Template"
    class_level VARCHAR(50) NOT NULL,
    ca_weight DECIMAL(5,2) DEFAULT 30.00, -- Continuous Assessment weight
    exam_weight DECIMAL(5,2) DEFAULT 70.00, -- Exam weight
    total_score DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Results
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    subject_id INTEGER REFERENCES subjects(id),
    term_id INTEGER REFERENCES terms(id),
    class_id INTEGER REFERENCES classes(id),
    ca_score DECIMAL(5,2),
    exam_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade VARCHAR(5), -- A, B, C, D, E, F
    position INTEGER,
    comments TEXT,
    teacher_id INTEGER REFERENCES users(id),
    is_approved BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Nursery Skills Assessment (for nursery students)
CREATE TABLE nursery_skills (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    term_id INTEGER REFERENCES terms(id),
    skill_category VARCHAR(100), -- e.g., "Social Skills", "Motor Skills", "Language"
    skill_name VARCHAR(100),
    rating VARCHAR(20) CHECK (rating IN ('excellent', 'good', 'fair', 'needs_improvement')),
    teacher_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'parents', 'teachers', 'students', 'staff')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    author_id INTEGER REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    subject VARCHAR(200),
    content TEXT NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('parent_teacher', 'admin_parent', 'general')),
    is_read BOOLEAN DEFAULT false,
    reply_to INTEGER REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Homework
CREATE TABLE homework (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student Homework Submissions
CREATE TABLE homework_submissions (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER REFERENCES homework(id),
    student_id INTEGER REFERENCES students(id),
    file_url VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT NOW(),
    grade VARCHAR(5),
    teacher_feedback TEXT
);

-- Expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100), -- e.g., "Salaries", "Utilities", "Maintenance", "Supplies"
    expense_date DATE,
    recorded_by INTEGER REFERENCES users(id),
    receipt_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_students_admission_no ON students(admission_no);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_fee_invoices_student_id ON fee_invoices(student_id);
CREATE INDEX idx_fee_invoices_status ON fee_invoices(status);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_results_student_term ON results(student_id, term_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('school_name', 'International Nursery and Primary School Enugu', 'Name of the school'),
('school_address', 'Enugu, Nigeria', 'School physical address'),
('school_phone', '+234 XXX XXX XXXX', 'School phone number'),
('school_email', 'info@inpse.com', 'School email address'),
('school_motto', 'Excellence in Education', 'School motto'),
('school_website', 'www.inpse.com', 'School website'),
('current_session', '1', 'Current active session ID'),
('current_term', '1', 'Current active term ID'),
('currency', 'NGN', 'Default currency for fees'),
('founded_year', '1985', 'Year school was founded');
