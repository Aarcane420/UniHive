const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a session title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  subject: {
    type: String,
    required: [true, 'Please select a subject'],
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics', 'Psychology', 'Other'],
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tutorName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide a session date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide a session time (HH:mm)'],
    match: [/^\d{2}:\d{2}$/, 'Please provide time in HH:mm format'],
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in minutes'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [300, 'Duration cannot exceed 300 minutes'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide session capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [50, 'Capacity cannot exceed 50'],
  },
  enrolledCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  meetingLink: {
    type: String,
    required: [true, 'Please provide a meeting link'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL',
    },
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  approverComments: {
    type: String,
    default: null,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
