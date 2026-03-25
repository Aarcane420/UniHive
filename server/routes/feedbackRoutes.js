const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getSessionFeedback,
  getTutorStats,
  getTopTutors,
} = require('../controllers/feedbackController');

const { protect: authMiddleware } = require('../middleware/authMiddleware');

// Private route (require authentication)
router.post('/', authMiddleware, submitFeedback);

// Public routes - specific paths first
router.get('/leaderboard/top-tutors', getTopTutors);

// Parameterized routes (must come after specific routes)
router.get('/session/:sessionId', getSessionFeedback);
router.get('/tutor/:tutorId', getTutorStats);

module.exports = router;
