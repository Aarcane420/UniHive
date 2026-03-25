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

const { protect: authMiddleware } = require('../middleware/authMiddleware');

// Specific routes MUST come before parameterized routes
// Public routes
router.get('/', getSessions);
router.get('/leaderboard/popular', getPopularSessions);

// Private routes (require authentication)
router.post('/', authMiddleware, createSession);
router.get('/tutor/my-sessions', authMiddleware, getTutorSessions);

// Admin routes
router.get('/admin/pending', authMiddleware, getPendingSessions);
router.put('/:id/approve', authMiddleware, approveSession);
router.put('/:id/reject', authMiddleware, rejectSession);

// Parameterized routes (must come LAST)
router.get('/:id', getSessionById);

module.exports = router;
