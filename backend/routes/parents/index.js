import express from 'express';
import {
  getParentChildren,
  getStudentParents,
  addParentStudentRelationship,
  removeParentStudentRelationship,
  updateParentStudentRelationship,
  getParentDashboard
} from './parentController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Parent-specific routes
router.get('/my-children', getParentChildren);
router.get('/dashboard', requireRole(['parent']), getParentDashboard);

// Student parent relationship routes
router.get('/students/:studentId/parents', getStudentParents);
router.post('/students/:studentId/parents', addParentStudentRelationship);
router.put('/students/:studentId/parents/:parentId', updateParentStudentRelationship);
router.delete('/students/:studentId/parents/:parentId', removeParentStudentRelationship);

export default router;
