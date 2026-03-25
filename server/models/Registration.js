const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  attendanceConfirmed: {
    type: Boolean,
    default: false,
  },
  attendanceConfirmedAt: {
    type: Date,
    default: null,
  },
  feedbackSubmitted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Unique index to prevent duplicate registrations
registrationSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
