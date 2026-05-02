import express from 'express';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getTerms,
  createTerm,
  updateTerm,
  deleteTerm
} from './academicController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Class routes
router.get('/classes', getClasses);
router.post('/classes', requireRole(['admin', 'proprietor']), createClass);
router.put('/classes/:id', requireRole(['admin', 'proprietor']), updateClass);
router.delete('/classes/:id', requireRole(['admin', 'proprietor']), deleteClass);

// Subject routes
router.get('/subjects', getSubjects);
router.post('/subjects', requireRole(['admin', 'proprietor']), createSubject);
router.put('/subjects/:id', requireRole(['admin', 'proprietor']), updateSubject);
router.delete('/subjects/:id', requireRole(['admin', 'proprietor']), deleteSubject);

// Session routes
router.get('/sessions', getSessions);
router.post('/sessions', requireRole(['admin', 'proprietor']), createSession);
router.put('/sessions/:id', requireRole(['admin', 'proprietor']), updateSession);
router.delete('/sessions/:id', requireRole(['admin', 'proprietor']), deleteSession);

// Term routes
router.get('/terms', getTerms);
router.post('/terms', requireRole(['admin', 'proprietor']), createTerm);
router.put('/terms/:id', requireRole(['admin', 'proprietor']), updateTerm);
router.delete('/terms/:id', requireRole(['admin', 'proprietor']), deleteTerm);

export default router;
