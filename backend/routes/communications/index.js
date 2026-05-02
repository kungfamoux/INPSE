import express from 'express';
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getConversation,
  markMessageAsRead,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  getMessagesByUser
} from './communicationController.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Message routes
router.get('/messages', getMessages);
router.post('/messages', createMessage);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);
router.get('/messages/conversation/:userId', getConversation);
router.put('/messages/:id/read', markMessageAsRead);
router.get('/messages/user/:userId', getMessagesByUser);

// Announcement routes
router.get('/announcements', getAnnouncements);
router.post('/announcements', requireRole(['admin', 'proprietor', 'teacher']), createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', requireRole(['admin', 'proprietor']), deleteAnnouncement);
router.put('/announcements/:id/publish', requireRole(['admin', 'proprietor']), publishAnnouncement);

export default router;
