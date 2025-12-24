const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  image: {
    type: String,
  },
  adminReply: {
    text: String,
    repliedAt: Date,
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const SupportMessage = mongoose.model('SupportMessage', supportMessageSchema);

module.exports = SupportMessage;
