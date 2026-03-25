const express = require('express');
const router = express.Router();
const {
  joinSession,
  getStudentRegistrations,
  getSessionEnrollments,
  leaveSession,
  confirmAttendance,
} = require('../controllers/registrationController');

const { protect: authMiddleware } = require('../middleware/authMiddleware');

// Private routes (require authentication)
router.post('/join', authMiddleware, joinSession);
router.get('/student/my-registrations', authMiddleware, getStudentRegistrations);

// Parameterized routes (must come after specific routes)
router.get('/session/:sessionId', authMiddleware, getSessionEnrollments);
router.delete('/:registrationId', authMiddleware, leaveSession);
router.put('/:registrationId/confirm-attendance', authMiddleware, confirmAttendance);

module.exports = router;
