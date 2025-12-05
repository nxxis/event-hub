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

    // disallow RSVPing to events that have already finished
    const now = new Date();
    if (ev.endAt && new Date(ev.endAt) <= now)
      return res.status(400).json({ message: 'Cannot RSVP to past events' });

    // if a ticket exists for this user+event, handle based on status
    const existing = await Ticket.findOne({
      event: eventId,
      user: req.user.id,
    });
    // compute desired status considering capacity
    const countActive = await Ticket.countDocuments({
      event: eventId,
      status: { $in: ['active', 'checked_in'] },
    });
    let status = 'active';
    if (countActive >= ev.capacity)
      status = ev.allowWaitlist ? 'waitlisted' : 'cancelled';

    if (existing) {
      if (existing.status === 'cancelled') {
        // reactivate the cancelled ticket
        existing.status = status;
        existing.issuedAt = Date.now();
        // sign payload again (refresh QR)
        const signed = sign(basePayload(eventId, existing._id.toString()));
        existing.qrCode = signed;
        await existing.save();
        return res.status(200).json({ ticketId: existing._id, status });
      }
      // already have a non-cancelled ticket
      return res.status(409).json({ message: 'Already RSVP’d' });
    }

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
    // return only non-cancelled tickets so cancelled RSVPs don't appear
    const tickets = await Ticket.find({
      user: req.user.id,
      status: { $ne: 'cancelled' },
    }).populate('event', 'title startAt endAt venue status description');
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
