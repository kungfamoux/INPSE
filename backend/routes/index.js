import express from 'express';
import authRoutes from './auth/index.js';
import studentRoutes from './students/index.js';
import academicRoutes from './academics/index.js';
import feeRoutes from './fees/index.js';
import staffRoutes from './staff/index.js';
import communicationRoutes from './communications/index.js';
import parentRoutes from './parents/index.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/academics', academicRoutes);
router.use('/fees', feeRoutes);
router.use('/staff', staffRoutes);
router.use('/communications', communicationRoutes);
router.use('/parents', parentRoutes);

export default router;
