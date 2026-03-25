const Session = require('../models/Session');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a new tutoring session
// @route   POST /api/sessions
// @access  Private (Tutor)
exports.createSession = async (req, res) => {
  try {
    const { title, description, subject, date, time, duration, capacity, meetingLink, tags } = req.body;

    // Validation
    if (!title || !description || !subject || !date || !time || !duration || !capacity || !meetingLink) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Validate date is in future
    const sessionDateTime = new Date(`${date}T${time}`);
    if (sessionDateTime < new Date()) {
      return res.status(400).json({ success: false, message: 'Session date must be in the future' });
    }

    const session = await Session.create({
      title,
      description,
      subject,
      date: sessionDateTime,
      time,
      duration,
      capacity,
      meetingLink,
      tags: tags || [],
      tutor: req.user.id,
      tutorName: `${req.user.firstName} ${req.user.lastName}`,
      status: 'Pending',
    });

    // Create notification for admin
    await Notification.create({
      recipient: null, // Will be queried for admins
      type: 'SessionApproved',
      title: 'New Session Pending Approval',
      message: `${session.tutorName} created a new session: ${title}`,
      relatedSession: session._id,
      relatedUser: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully. Awaiting admin approval.',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved sessions with filters
// @route   GET /api/sessions
// @access  Public
exports.getSessions = async (req, res) => {
  try {
    const { subject, sortBy, search } = req.query;
    
    let filter = { status: 'Approved' };

    // Apply subject filter
    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    // Apply search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sortBy === 'popular') {
      sortOption = { viewCount: -1 };
    } else if (sortBy === 'upcoming') {
      sortOption = { date: 1 };
    } else if (sortBy === 'rating') {
      sortOption = { averageRating: -1 };
    }

    const sessions = await Session.find(filter)
      .populate('tutor', 'firstName lastName email')
      .sort(sortOption)
      .exec();

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Public
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('tutor', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Get enrollments for this session
    const enrollments = await Registration.find({ session: id });

    res.status(200).json({
      success: true,
      data: {
        ...session._doc,
        enrolledCount: enrollments.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sessions created by logged-in tutor
// @route   GET /api/sessions/tutor/my-sessions
// @access  Private (Tutor)
exports.getTutorSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ tutor: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending sessions for admin approval
// @route   GET /api/sessions/admin/pending
// @access  Private (Admin)
exports.getPendingSessions = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const sessions = await Session.find({ status: 'Pending' })
      .populate('tutor', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a session
// @route   PUT /api/sessions/:id/approve
// @access  Private (Admin)
exports.approveSession = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { approverComments } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approverComments },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Notify tutor
    await Notification.create({
      recipient: session.tutor,
      type: 'SessionApproved',
      title: 'Session Approved',
      message: `Your session "${session.title}" has been approved!`,
      relatedSession: session._id,
      actionUrl: `/sessions/${session._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Session approved successfully',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a session
// @route   PUT /api/sessions/:id/reject
// @access  Private (Admin)
exports.rejectSession = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Please provide a rejection reason' });
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', rejectionReason },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Notify tutor
    await Notification.create({
      recipient: session.tutor,
      type: 'SessionRejected',
      title: 'Session Rejected',
      message: `Your session "${session.title}" was rejected. Reason: ${rejectionReason}`,
      relatedSession: session._id,
    });

    res.status(200).json({
      success: true,
      message: 'Session rejected successfully',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get popular sessions (leaderboard)
// @route   GET /api/sessions/leaderboard/popular
// @access  Public
exports.getPopularSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'Approved' })
      .sort({ viewCount: -1, averageRating: -1 })
      .limit(10)
      .populate('tutor', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
