const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'waitlisted', 'checked_in'],
      default: 'active',
      index: true,
    },
    qrCode: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TicketSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', TicketSchema);
