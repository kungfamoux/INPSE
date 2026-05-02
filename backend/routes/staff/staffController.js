import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// General Staff Management
export const getStaff = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        users(first_name, last_name, email, phone, role)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { user_id, employee_no, qualification, specialization, hire_date, salary, department } = req.body;
    
    const { data, error } = await supabase
      .from('staff')
      .insert([{
        user_id,
        employee_no,
        qualification,
        specialization,
        hire_date,
        salary,
        department
      }])
      .select(`
        *,
        users(first_name, last_name, email, phone, role)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users(first_name, last_name, email, phone, role)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: error.message });
  }
};

// Teacher-specific Management
export const getTeachers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        users(first_name, last_name, email, phone),
        classes(name, level)
      `)
      .eq('users.role', 'teacher')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { user_id, employee_no, qualification, specialization, hire_date, salary, class_id } = req.body;
    
    // Start a transaction
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert([{
        user_id,
        employee_no,
        qualification,
        specialization,
        hire_date,
        salary,
        department: 'Academic'
      }])
      .select()
      .single();
    
    if (staffError) throw staffError;
    
    // Update class with teacher
    if (class_id) {
      await supabase
        .from('classes')
        .update({ teacher_id: user_id })
        .eq('id', class_id);
    }
    
    // Get complete teacher data
    const { data: teacherData, error: teacherError } = await supabase
      .from('staff')
      .select(`
        *,
        users(first_name, last_name, email, phone),
        classes(name, level)
      `)
      .eq('id', staff.id)
      .single();
    
    if (teacherError) throw teacherError;
    
    res.status(201).json(teacherData);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, ...updateData } = req.body;
    
    // Update staff record
    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users(first_name, last_name, email, phone),
        classes(name, level)
      `)
      .single();
    
    if (error) throw error;
    
    // Update class assignment if provided
    if (class_id !== undefined) {
      if (class_id) {
        await supabase
          .from('classes')
          .update({ teacher_id: data.user_id })
          .eq('id', class_id);
      } else {
        // Remove teacher from class
        await supabase
          .from('classes')
          .update({ teacher_id: null })
          .eq('teacher_id', data.user_id);
      }
    }
    
    // Get updated data
    const { data: updatedData, error: updateError } = await supabase
      .from('staff')
      .select(`
        *,
        users(first_name, last_name, email, phone),
        classes(name, level)
      `)
      .eq('id', id)
      .single();
    
    if (updateError) throw updateError;
    
    res.json(updatedData);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get teacher info before deletion
    const { data: teacher, error: fetchError } = await supabase
      .from('staff')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Remove teacher from class
    await supabase
      .from('classes')
      .update({ teacher_id: null })
      .eq('teacher_id', teacher.user_id);
    
    // Delete staff record
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: error.message });
  }
};

// Staff by Role
export const getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        users(first_name, last_name, email, phone)
      `)
      .eq('users.role', role)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff by role:', error);
    res.status(500).json({ error: error.message });
  }
};

// Staff Attendance
export const getStaffAttendance = async (req, res) => {
  try {
    const { date_from, date_to, staff_id } = req.query;
    
    let query = supabase
      .from('staff_attendance')
      .select(`
        *,
        staff(
          users(first_name, last_name, email),
          employee_no
        )
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (date_from) query = query.gte('date', date_from);
    if (date_to) query = query.lte('date', date_to);
    if (staff_id) query = query.eq('staff_id', staff_id);

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

export const markStaffAttendance = async (req, res) => {
  try {
    const { staff_id, date, status, reason } = req.body;
    
    const { data, error } = await supabase
      .from('staff_attendance')
      .insert([{
        staff_id,
        date,
        status,
        reason,
        marked_by: req.user.id
      }])
      .select(`
        *,
        staff(
          users(first_name, last_name, email),
          employee_no
        )
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error marking staff attendance:', error);
    res.status(500).json({ error: error.message });
  }
};
