const Feedback = require('../models/Feedback');
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

// @desc    Submit feedback for a session
// @route   POST /api/feedback
// @access  Private (Student)
exports.submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment, categories } = req.body;
    const studentId = req.user.id;

    // Validation
    if (!sessionId || !rating || !categories) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if student was registered
    const registration = await Registration.findOne({ session: sessionId, student: studentId });
    if (!registration) {
      return res.status(403).json({ success: false, message: 'You were not enrolled in this session' });
    }

    // Check if already submitted feedback
    const existingFeedback = await Feedback.findOne({ session: sessionId, student: studentId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this session' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      session: sessionId,
      tutor: session.tutor,
      student: studentId,
      rating,
      comment: comment || '',
      categories: {
        clarity: categories.clarity || rating,
        engagement: categories.engagement || rating,
        helpfulness: categories.helpfulness || rating,
      },
    });

    // Update registration
    await Registration.findByIdAndUpdate(registrationId, { feedbackSubmitted: true });

    // Update session average rating
    const allFeedback = await Feedback.find({ session: sessionId });
    const avgRating = allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length;
    await Session.findByIdAndUpdate(sessionId, { averageRating: avgRating });

    // Notify tutor
    await Notification.create({
      recipient: session.tutor,
      type: 'FeedbackReceived',
      title: 'New Feedback Received',
      message: `${req.user.firstName} ${req.user.lastName} left feedback for "${session.title}": ${rating}/5 stars`,
      relatedSession: sessionId,
      relatedUser: studentId,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feedback for a session
// @route   GET /api/feedback/session/:sessionId
// @access  Public
exports.getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const feedback = await Feedback.find({ session: sessionId })
      .populate('student', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({ session: sessionId });

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tutor's average rating
// @route   GET /api/feedback/tutor/:tutorId
// @access  Public
exports.getTutorStats = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const feedback = await Feedback.find({ tutor: tutorId });
    
    if (feedback.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          breakdown: {
            clarity: 0,
            engagement: 0,
            helpfulness: 0,
          },
        },
      });
    }

    const totalReviews = feedback.length;
    const averageRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / totalReviews;
    const avgClarity = feedback.reduce((sum, fb) => sum + fb.categories.clarity, 0) / totalReviews;
    const avgEngagement = feedback.reduce((sum, fb) => sum + fb.categories.engagement, 0) / totalReviews;
    const avgHelpfulness = feedback.reduce((sum, fb) => sum + fb.categories.helpfulness, 0) / totalReviews;

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating.toFixed(1),
        breakdown: {
          clarity: avgClarity.toFixed(1),
          engagement: avgEngagement.toFixed(1),
          helpfulness: avgHelpfulness.toFixed(1),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top tutors leaderboard
// @route   GET /api/feedback/leaderboard/top-tutors
// @access  Public
exports.getTopTutors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Aggregate feedback by tutor
    const tutors = await Feedback.aggregate([
      {
        $group: {
          _id: '$tutor',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1, totalReviews: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'tutorInfo',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: tutors.map(t => ({
        tutor: t._id,
        tutorName: t.tutorInfo[0]?.firstName + ' ' + t.tutorInfo[0]?.lastName,
        averageRating: t.averageRating.toFixed(1),
        totalReviews: t.totalReviews,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
