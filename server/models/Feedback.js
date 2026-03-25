const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    maxlength: [300, 'Comment cannot exceed 300 characters'],
    default: '',
  },
  categories: {
    clarity: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    engagement: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Unique index to prevent duplicate feedback
feedbackSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
