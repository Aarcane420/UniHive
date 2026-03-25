const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getSessionFeedback,
  getTutorStats,
  getTopTutors,
} = require('../controllers/feedbackController');

const authMiddleware = require('../middleware/authMiddleware');

// Private route (require authentication)
router.post('/', authMiddleware, submitFeedback);

// Public routes
router.get('/session/:sessionId', getSessionFeedback);
router.get('/tutor/:tutorId', getTutorStats);
router.get('/leaderboard/top-tutors', getTopTutors);

module.exports = router;
