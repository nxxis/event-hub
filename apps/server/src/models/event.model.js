const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    venue: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
    allowWaitlist: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'draft',
      index: true,
    },
    tags: [{ type: String }],
  imageStyle: { type: String, enum: ['photorealistic', 'illustration', 'cinematic'], default: 'photorealistic' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
