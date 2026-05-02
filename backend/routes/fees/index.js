import express from 'express';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeInvoices,
  createFeeInvoice,
  updateFeeInvoice,
  deleteFeeInvoice,
  getPayments,
  createPayment,
  getStudentFees,
  generateFeeReport
} from './feeController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Fee Structure routes
router.get('/structures', getFeeStructures);
router.post('/structures', requireRole(['admin', 'proprietor', 'accountant']), createFeeStructure);
router.put('/structures/:id', requireRole(['admin', 'proprietor', 'accountant']), updateFeeStructure);
router.delete('/structures/:id', requireRole(['admin', 'proprietor']), deleteFeeStructure);

// Fee Invoice routes
router.get('/invoices', getFeeInvoices);
router.post('/invoices', requireRole(['admin', 'proprietor', 'accountant']), createFeeInvoice);
router.put('/invoices/:id', requireRole(['admin', 'proprietor', 'accountant']), updateFeeInvoice);
router.delete('/invoices/:id', requireRole(['admin', 'proprietor']), deleteFeeInvoice);

// Payment routes
router.get('/payments', getPayments);
router.post('/payments', requireRole(['admin', 'proprietor', 'accountant']), createPayment);

// Student-specific fee routes
router.get('/students/:studentId', getStudentFees);

// Reports
router.get('/reports', requireRole(['admin', 'proprietor', 'accountant']), generateFeeReport);

export default router;
