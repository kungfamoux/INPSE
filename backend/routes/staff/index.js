import express from 'express';
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStaffByRole,
  getStaffAttendance,
  markStaffAttendance
} from './staffController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// General staff routes
router.get('/', getStaff);
router.post('/', requireRole(['admin', 'proprietor']), createStaff);
router.put('/:id', requireRole(['admin', 'proprietor']), updateStaff);
router.delete('/:id', requireRole(['admin', 'proprietor']), deleteStaff);

// Teacher-specific routes
router.get('/teachers', getTeachers);
router.post('/teachers', requireRole(['admin', 'proprietor']), createTeacher);
router.put('/teachers/:id', requireRole(['admin', 'proprietor']), updateTeacher);
router.delete('/teachers/:id', requireRole(['admin', 'proprietor']), deleteTeacher);

// Staff by role
router.get('/role/:role', getStaffByRole);

// Staff attendance
router.get('/attendance', getStaffAttendance);
router.post('/attendance', requireRole(['admin', 'proprietor']), markStaffAttendance);

export default router;
