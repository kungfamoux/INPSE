-- Create initial admin user for International Nursery and Primary School Enugu
-- Run this in Supabase SQL Editor after the main schema

-- Hashed password for "admin123" (using bcrypt)
-- You can change this password as needed

INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    is_approved
) VALUES (
    'admin@inpse.com',
    '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    'System',
    'Administrator',
    '+234 XXX XXX XXXX',
    'admin',
    true,
    true
);

-- Update system settings with current session and term
UPDATE system_settings SET setting_value = '1' WHERE setting_key = 'current_session';
UPDATE system_settings SET setting_value = '1' WHERE setting_key = 'current_term';

-- Create default academic session (2024/2025)
INSERT INTO sessions (name, start_date, end_date, is_active) VALUES 
('2024/2025', '2024-09-01', '2025-07-31', true);

-- Create default terms
INSERT INTO terms (session_id, name, start_date, end_date, is_active) VALUES 
(1, 'First Term', '2024-09-01', '2024-12-15', true),
(1, 'Second Term', '2025-01-05', '2025-03-28', false),
(1, 'Third Term', '2025-04-15', '2025-07-31', false);

-- Create default classes
INSERT INTO classes (name, level, capacity) VALUES 
('Creche', 'Creche', 20),
('Nursery 1', 'Nursery', 25),
('Nursery 2', 'Nursery', 25),
('Primary 1', 'Primary 1', 30),
('Primary 2', 'Primary 2', 30),
('Primary 3', 'Primary 3', 30),
('Primary 4', 'Primary 4', 30),
('Primary 5', 'Primary 5', 30),
('Primary 6', 'Primary 6', 30);

-- Create default subjects
INSERT INTO subjects (name, code, is_active) VALUES 
('Mathematics', 'MATH', true),
('English Language', 'ENG', true),
('Science', 'SCI', true),
('Social Studies', 'SST', true),
('Basic Science', 'BSC', true),
('Basic Technology', 'BTE', true),
('Physical Health Education', 'PHE', true),
('Computer Studies', 'ICT', true),
('Home Economics', 'HEC', true),
('Agricultural Science', 'AGR', true),
('Civic Education', 'CIV', true),
('Creative Arts', 'ART', true),
('Religious Studies', 'RST', true),
('French Language', 'FRN', true),
('Igbo Language', 'IGB', true);

-- Create default fee structures
INSERT INTO fee_structures (name, class_level, tuition_fee, pta_levy, bus_fee, uniform_fee, books_fee, feeding_fee, session_id, is_active) VALUES 
('Creche Fees', 'Creche', 15000, 2000, 3000, 5000, 3000, 8000, 1, true),
('Nursery 1 Fees', 'Nursery', 20000, 2000, 3000, 6000, 4000, 8000, 1, true),
('Nursery 2 Fees', 'Nursery', 20000, 2000, 3000, 6000, 4000, 8000, 1, true),
('Primary 1 Fees', 'Primary 1', 25000, 3000, 3000, 7000, 5000, 8000, 1, true),
('Primary 2 Fees', 'Primary 2', 25000, 3000, 3000, 7000, 5000, 8000, 1, true),
('Primary 3 Fees', 'Primary 3', 25000, 3000, 3000, 7000, 5000, 8000, 1, true),
('Primary 4 Fees', 'Primary 4', 30000, 3000, 3000, 7000, 6000, 8000, 1, true),
('Primary 5 Fees', 'Primary 5', 30000, 3000, 3000, 7000, 6000, 8000, 1, true),
('Primary 6 Fees', 'Primary 6', 30000, 3000, 3000, 7000, 6000, 8000, 1, true);

-- Create score templates
INSERT INTO score_templates (name, class_level, ca_weight, exam_weight, total_score) VALUES 
('Nursery Template', 'Nursery', 40.00, 60.00, 100.00),
('Primary Template', 'Primary', 30.00, 70.00, 100.00);
