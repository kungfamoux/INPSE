import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get parent's children
export const getParentChildren = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parent_children')
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
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching parent children:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student's parents
export const getStudentParents = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check if user has permission to view this student's parents
    if (req.user.role === 'parent') {
      // Parents can only see parents of their own children
      const { data: relationship } = await supabase
        .from('parent_student_relationships')
        .select('id')
        .eq('parent_id', req.user.id)
        .eq('student_id', studentId)
        .single();
      
      if (!relationship) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const { data, error } = await supabase
      .from('student_parents')
      .select(`
        parent_id,
        parent_first_name,
        parent_last_name,
        parent_email,
        parent_phone,
        relationship_type,
        is_primary_contact,
        emergency_priority
      `)
      .eq('student_id', studentId)
      .order('emergency_priority', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student parents:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add parent-student relationship
export const addParentStudentRelationship = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { parent_id, relationship_type, is_primary_contact, emergency_priority } = req.body;
    
    // Only admin and proprietor can add relationships
    if (!['admin', 'proprietor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { data, error } = await supabase
      .from('parent_student_relationships')
      .insert([{
        parent_id,
        student_id: studentId,
        relationship_type: relationship_type || 'parent',
        is_primary_contact: is_primary_contact || false,
        emergency_priority: emergency_priority || 1
      }])
      .select(`
        *,
        users(first_name, last_name, email, phone),
        students(first_name, last_name, admission_no)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding parent-student relationship:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update parent-student relationship
export const updateParentStudentRelationship = async (req, res) => {
  try {
    const { studentId, parentId } = req.params;
    const { relationship_type, is_primary_contact, emergency_priority } = req.body;
    
    // Only admin and proprietor can update relationships
    if (!['admin', 'proprietor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { data, error } = await supabase
      .from('parent_student_relationships')
      .update({
        relationship_type,
        is_primary_contact,
        emergency_priority
      })
      .eq('student_id', studentId)
      .eq('parent_id', parentId)
      .select(`
        *,
        users(first_name, last_name, email, phone),
        students(first_name, last_name, admission_no)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating parent-student relationship:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove parent-student relationship
export const removeParentStudentRelationship = async (req, res) => {
  try {
    const { studentId, parentId } = req.params;
    
    // Only admin and proprietor can remove relationships
    if (!['admin', 'proprietor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { error } = await supabase
      .from('parent_student_relationships')
      .delete()
      .eq('student_id', studentId)
      .eq('parent_id', parentId);
    
    if (error) throw error;
    res.json({ message: 'Parent-student relationship removed successfully' });
  } catch (error) {
    console.error('Error removing parent-student relationship:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get parent dashboard data
export const getParentDashboard = async (req, res) => {
  try {
    // Get parent's children with their classes
    const { data: children, error: childrenError } = await supabase
      .from('parent_children')
      .select(`
        student_id,
        student_first_name,
        student_last_name,
        admission_no,
        class_id,
        classes(name, level, color)
      `)
      .eq('parent_id', req.user.id);
    
    if (childrenError) throw childrenError;
    
    // Get fee information for each child
    const studentIds = children.map(child => child.student_id);
    let feeData = [];
    
    if (studentIds.length > 0) {
      const { data: fees, error: feesError } = await supabase
        .from('fee_invoices')
        .select(`
          *,
          fee_structures(name, total_amount),
          students(first_name, last_name, admission_no)
        `)
        .in('student_id', studentIds)
        .order('due_date', { ascending: false });
      
      if (!feesError) {
        feeData = fees;
      }
    }
    
    // Get attendance information for each child
    let attendanceData = [];
    if (studentIds.length > 0) {
      const { data: attendance, error: attendanceError } = await supabase
        .from('student_attendance')
        .select(`
          *,
          students(first_name, last_name, admission_no)
        `)
        .in('student_id', studentIds)
        .order('date', { ascending: false })
        .limit(50); // Recent attendance records
      
      if (!attendanceError) {
        attendanceData = attendance;
      }
    }
    
    // Get results information for each child
    let resultsData = [];
    if (studentIds.length > 0) {
      const { data: results, error: resultsError } = await supabase
        .from('student_results')
        .select(`
          *,
          students(first_name, last_name, admission_no),
          subjects(name, code)
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false })
        .limit(50); // Recent results
      
      if (!resultsError) {
        resultsData = results;
      }
    }
    
    res.json({
      children,
      fees: feeData,
      attendance: attendanceData,
      results: resultsData
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};
