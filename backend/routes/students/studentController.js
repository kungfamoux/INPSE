import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper function to generate admission number
async function generateAdmissionNumber() {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from('students')
    .select('admission_no')
    .like('admission_no', `${year}/%`)
    .order('admission_no', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (data && data.admission_no) {
    const lastNumber = parseInt(data.admission_no.split('/')[1]);
    nextNumber = lastNumber + 1;
  }

  return `${year}/${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students (role-based access)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: integer
 *         description: Filter by parent ID (auto-applied for parent role)
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new student (Admin/Proprietor only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - date_of_birth
 *               - gender
 *               - class_id
 *               - parent_id
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: First name
 *               last_name:
 *                 type: string
 *                 description: Last name
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Gender
 *               class_id:
 *                 type: integer
 *                 description: Class ID
 *               parent_id:
 *                 type: integer
 *                 description: Parent ID
 *               address:
 *                 type: string
 *                 description: Home address
 *               emergency_contact:
 *                 type: string
 *                 description: Emergency contact number
 *               medical_conditions:
 *                 type: string
 *                 description: Medical conditions
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all students with role-based access
export const getStudents = async (req, res) => {
  try {
    let query;

    // Apply role-based filtering
    if (req.user.role === 'parent') {
      // Parents can only see their own children using the relationship table
      query = supabase
        .from('student_parents')
        .select(`
          student_id,
          student_first_name,
          student_last_name,
          admission_no,
          date_of_birth,
          gender,
          address,
          emergency_contact,
          medical_conditions,
          class_id,
          classes(name, level, color),
          created_at,
          updated_at
        `)
        .eq('parent_id', req.user.id)
        .order('student_last_name', { ascending: true });
    } else {
      // Admin, proprietor, teacher, accountant can see students with parent info
      query = supabase
        .from('students')
        .select(`
          *,
          classes(name, level, color),
          student_parents(
            parent_id,
            parent_first_name,
            parent_last_name,
            parent_email,
            parent_phone,
            relationship_type,
            is_primary_contact,
            emergency_priority
          )
        `)
        .order('last_name', { ascending: true });
      
      if (req.user.role === 'teacher') {
        // Teachers can only see students in their assigned classes
        const { data: teacherData } = await supabase
          .from('staff')
          .select('class_id')
          .eq('user_id', req.user.id)
          .single();
        
        if (teacherData && teacherData.class_id) {
          query = query.eq('class_id', teacherData.class_id);
        } else {
          // Teacher not assigned to any class
          return res.json([]);
        }
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = supabase
      .from('students')
      .select(`
        *,
        classes(name, level),
        users(first_name, last_name, email, phone)
      `)
      .eq('id', id);

    // Role-based access control
    if (req.user.role === 'parent') {
      query = query.eq('parent_id', req.user.id);
    }

    const { data, error } = await query.single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new student
export const createStudent = async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, class_id, parent_ids, address, emergency_contact, medical_conditions } = req.body;
    
    // Generate admission number
    const admission_no = await generateAdmissionNumber();
    
    // Create student without parent_id (using new relationship system)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        admission_no,
        first_name,
        last_name,
        date_of_birth,
        gender,
        class_id,
        address,
        emergency_contact,
        medical_conditions
      }])
      .select(`
        *,
        classes(name, level, color)
      `)
      .single();
    
    if (studentError) throw studentError;
    
    // Create parent-student relationships if parent_ids provided
    if (parent_ids && parent_ids.length > 0) {
      const relationships = parent_ids.map((parent_id, index) => ({
        parent_id,
        student_id: student.id,
        relationship_type: 'parent',
        is_primary_contact: index === 0, // First parent is primary contact
        emergency_priority: index + 1
      }));
      
      const { error: relationshipError } = await supabase
        .from('parent_student_relationships')
        .insert(relationships);
      
      if (relationshipError) throw relationshipError;
    }
    
    // Fetch complete student data with parent relationships
    const { data: completeStudent, error: fetchError } = await supabase
      .from('students')
      .select(`
        *,
        classes(name, level, color),
        student_parents(
          parent_id,
          parent_first_name,
          parent_last_name,
          parent_email,
          parent_phone,
          relationship_type,
          is_primary_contact,
          emergency_priority
        )
      `)
      .eq('id', student.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    res.status(201).json(completeStudent);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        classes(name, level),
        users(first_name, last_name, email, phone)
      `)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student results
export const getStudentResults = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        subjects(name, code),
        classes(name, level),
        terms(name, sessions(name))
      `)
      .eq('student_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ error: error.message });
  }
};
