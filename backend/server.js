import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireRole, generateToken, verifyPassword, hashPassword } from './middleware/auth.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://your-app.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes

// Enhanced Students API with authentication
app.get('/api/students', authenticateToken, requireRole(['admin', 'teacher', 'parent']), async (req, res) => {
  try {
    let query = supabase
      .from('students')
      .select(`
        *,
        classes(name, level),
        users(first_name, last_name, email, phone)
      `);

    // Parents can only see their own children
    if (req.user.role === 'parent') {
      query = query.eq('parent_id', req.user.id);
    }

    // Teachers can only see students in their classes
    if (req.user.role === 'teacher') {
      query = query.eq('classes.teacher_id', req.user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', authenticateToken, requireRole(['admin', 'proprietor']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      class_id,
      parent_id,
      address,
      emergency_contact,
      medical_conditions
    } = req.body;

    // Generate admission number
    const admission_no = await generateAdmissionNumber();

    const { data, error } = await supabase
      .from('students')
      .insert([{
        admission_no,
        first_name,
        last_name,
        date_of_birth,
        gender,
        class_id,
        parent_id,
        address,
        emergency_contact,
        medical_conditions
      }])
      .select(`
        *,
        classes(name, level),
        users(first_name, last_name, email, phone)
      `)
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:id', authenticateToken, requireRole(['admin', 'proprietor']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .update(req.body)
      .eq('id', req.params.id)
      .select(`
        *,
        classes(name, level),
        users(first_name, last_name, email, phone)
      `)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', authenticateToken, requireRole(['admin', 'proprietor']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Classes
app.get('/api/classes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff
app.get('/api/staff', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fee Invoices
app.get('/api/fee-invoices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fee_invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching fee invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    if (!user.is_approved && user.role !== 'admin') {
      return res.status(401).json({ error: 'Account pending approval' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register new user (for admin to create accounts)
app.post('/api/auth/register', authenticateToken, requireRole(['admin', 'proprietor']), async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role } = req.body;

    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        role,
        is_approved: role === 'admin' // Auto-approve admin users
      }])
      .select()
      .single();

    if (error) throw error;

    const { password_hash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});
