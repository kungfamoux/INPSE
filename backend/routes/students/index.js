import express from 'express';
import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentById,
  getStudentAttendance,
  getStudentResults
} from './studentController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all students (role-based access)
router.get('/', getStudents);

// Get specific student by ID
router.get('/:id', getStudentById);

// Create student (admin/proprietor only)
router.post('/', requireRole(['admin', 'proprietor']), createStudent);

// Update student (admin/proprietor only)
router.put('/:id', requireRole(['admin', 'proprietor']), updateStudent);

// Delete student (admin/proprietor only)
router.delete('/:id', requireRole(['admin', 'proprietor']), deleteStudent);

// Get student attendance
router.get('/:id/attendance', getStudentAttendance);

// Get student results
router.get('/:id/results', getStudentResults);

export default router;
