import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Fee Structure Management
export const getFeeStructures = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .select(`
        *,
        sessions(name)
      `)
      .order('class_level');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createFeeStructure = async (req, res) => {
  try {
    const { name, class_level, tuition_fee, pta_levy, bus_fee, uniform_fee, books_fee, feeding_fee, session_id } = req.body;
    
    const { data, error } = await supabase
      .from('fee_structures')
      .insert([{
        name,
        class_level,
        tuition_fee,
        pta_levy,
        bus_fee,
        uniform_fee,
        books_fee,
        feeding_fee,
        session_id
      }])
      .select(`
        *,
        sessions(name)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('fee_structures')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        sessions(name)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating fee structure:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('fee_structures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fee Invoice Management
export const getFeeInvoices = async (req, res) => {
  try {
    let query = supabase
      .from('fee_invoices')
      .select(`
        *,
        students(first_name, last_name, admission_no),
        fee_structures(name, class_level, total_amount),
        terms(name, sessions(name))
      `)
      .order('created_at', { ascending: false });

    // Parents can only see their children's invoices
    if (req.user.role === 'parent') {
      query = query.eq('students.parent_id', req.user.id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching fee invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createFeeInvoice = async (req, res) => {
  try {
    const { student_id, fee_structure_id, term_id, due_date } = req.body;
    
    // Get fee structure details
    const { data: feeStructure, error: feeError } = await supabase
      .from('fee_structures')
      .select('total_amount')
      .eq('id', fee_structure_id)
      .single();
    
    if (feeError) throw feeError;
    
    // Generate invoice number
    const invoice_number = `INV-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('fee_invoices')
      .insert([{
        invoice_number,
        student_id,
        fee_structure_id,
        term_id,
        total_amount: feeStructure.total_amount,
        due_date
      }])
      .select(`
        *,
        students(first_name, last_name, admission_no),
        fee_structures(name, class_level, total_amount),
        terms(name)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating fee invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateFeeInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('fee_invoices')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        students(first_name, last_name, admission_no),
        fee_structures(name, class_level, total_amount),
        terms(name)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating fee invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFeeInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('fee_invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Fee invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Payment Management
export const getPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        fee_invoices(invoice_number, total_amount),
        students(first_name, last_name, admission_no)
      `)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { invoice_id, payment_method, amount, transaction_id, recorded_by } = req.body;
    
    // Generate receipt number
    const receipt_number = `RCP-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        invoice_id,
        payment_method,
        amount,
        transaction_id,
        receipt_number,
        recorded_by
      }])
      .select(`
        *,
        fee_invoices(invoice_number, total_amount),
        students(first_name, last_name, admission_no)
      `)
      .single();
    
    if (error) throw error;
    
    // Update invoice paid amount
    await supabase.rpc('update_invoice_paid_amount', { invoice_id });
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Student-specific fee information
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data, error } = await supabase
      .from('fee_invoices')
      .select(`
        *,
        fee_structures(name, class_level),
        terms(name),
        payments(
          receipt_number,
          amount,
          payment_method,
          payment_date
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fee Reports
export const generateFeeReport = async (req, res) => {
  try {
    const { session_id, term_id, class_level, date_from, date_to } = req.query;
    
    let query = supabase
      .from('fee_invoices')
      .select(`
        *,
        students(first_name, last_name, class_id),
        classes(name, level),
        fee_structures(class_level, total_amount),
        terms(name),
        payments(
          receipt_number,
          amount,
          payment_method,
          payment_date
        )
      `);

    // Apply filters
    if (session_id) query = query.eq('terms.session_id', session_id);
    if (term_id) query = query.eq('term_id', term_id);
    if (class_level) query = query.eq('fee_structures.class_level', class_level);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error generating fee report:', error);
    res.status(500).json({ error: error.message });
  }
};
