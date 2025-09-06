const Ticket = require('../models/ticket.model');
const Event = require('../models/event.model');
const { toDataURL } = require('../utils/qr');
const { sign } = require('../utils/sign');

function basePayload(eventId, ticketId) {
  return `EV:${eventId}|TK:${ticketId}`;
}

exports.rsvp = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const ev = await Event.findById(eventId);
    if (!ev || ev.status !== 'published')
      return res.status(400).json({ message: 'Event not available' });

    const countActive = await Ticket.countDocuments({
      event: eventId,
      status: { $in: ['active', 'checked_in'] },
    });
    let status = 'active';
    if (countActive >= ev.capacity)
      status = ev.allowWaitlist ? 'waitlisted' : 'cancelled';

    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.id,
      status,
      qrCode: 'placeholder',
    });

    // sign the payload
    const signed = sign(basePayload(eventId, ticket._id.toString()));
    ticket.qrCode = signed;
    await ticket.save();

    res.status(201).json({ ticketId: ticket._id, status });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ message: 'Already RSVP’d' });
    next(e);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).populate(
      'event',
      'title startAt venue status'
    );
    res.json(tickets);
  } catch (e) {
    next(e);
  }
};

exports.qrImage = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const dataUrl = await toDataURL(ticket.qrCode);
    const base64 = dataUrl.split(',')[1];
    const img = Buffer.from(base64, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (e) {
    next(e);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const t = await Ticket.findOneAndUpdate(
      { _id: req.params.ticketId, user: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Cancelled' });
  } catch (e) {
    next(e);
  }
};
