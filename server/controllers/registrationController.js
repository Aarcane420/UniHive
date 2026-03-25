const Registration = require('../models/Registration');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

// @desc    Join a tutoring session
// @route   POST /api/registrations/join
// @access  Private (Student)
exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if session is approved
    if (session.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'This session is not available for enrollment' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ session: sessionId, student: studentId });
    if (existingRegistration) {
      return res.status(400).json({ success: false, message: 'You are already registered for this session' });
    }

    // Check if session is full
    const enrolledCount = await Registration.countDocuments({ session: sessionId });
    if (enrolledCount >= session.capacity) {
      return res.status(400).json({ success: false, message: 'Session is full' });
    }

    // Create registration
    const registration = await Registration.create({
      session: sessionId,
      student: studentId,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
    });

    // Update enrolled count
    await Session.findByIdAndUpdate(
      sessionId,
      { $inc: { enrolledCount: 1 } }
    );

    // Notify student
    await Notification.create({
      recipient: studentId,
      type: 'SessionJoined',
      title: 'Successfully Joined Session',
      message: `You have successfully joined "${session.title}"`,
      relatedSession: sessionId,
      actionUrl: `/sessions/${sessionId}`,
    });

    // Notify tutor
    await Notification.create({
      recipient: session.tutor,
      type: 'NewEnrollment',
      title: 'New Student Enrolled',
      message: `${req.user.firstName} ${req.user.lastName} has joined your session "${session.title}"`,
      relatedSession: sessionId,
      relatedUser: studentId,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined the session',
      data: registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sessions joined by student
// @route   GET /api/registrations/student/my-registrations
// @access  Private (Student)
exports.getStudentRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user.id })
      .populate({
        path: 'session',
        select: 'title subject date time duration tutor',
        populate: { path: 'tutor', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get students enrolled in a session
// @route   GET /api/registrations/session/:sessionId
// @access  Private (Tutor)
exports.getSessionEnrollments = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only tutor of the session can view enrollments
    if (session.tutor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const registrations = await Registration.find({ session: sessionId })
      .populate('student', 'firstName lastName email')
      .sort({ joinedAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave a session
// @route   DELETE /api/registrations/:registrationId
// @access  Private (Student)
exports.leaveSession = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Check if user is the student
    if (registration.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete registration
    await Registration.findByIdAndDelete(registrationId);

    // Update enrolled count
    await Session.findByIdAndUpdate(
      registration.session,
      { $inc: { enrolledCount: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully left the session',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm attendance
// @route   PUT /api/registrations/:registrationId/confirm-attendance
// @access  Private (Student)
exports.confirmAttendance = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Registration.findByIdAndUpdate(
      registrationId,
      {
        attendanceConfirmed: true,
        attendanceConfirmedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance confirmed',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
