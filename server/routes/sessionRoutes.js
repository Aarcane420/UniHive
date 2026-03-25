const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSessionById,
  getTutorSessions,
  getPendingSessions,
  approveSession,
  rejectSession,
  getPopularSessions,
} = require('../controllers/sessionController');

const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.get('/leaderboard/popular', getPopularSessions);

// Private routes (require authentication)
router.post('/', authMiddleware, createSession);
router.get('/tutor/my-sessions', authMiddleware, getTutorSessions);

// Admin routes
router.get('/admin/pending', authMiddleware, getPendingSessions);
router.put('/:id/approve', authMiddleware, approveSession);
router.put('/:id/reject', authMiddleware, rejectSession);

module.exports = router;
