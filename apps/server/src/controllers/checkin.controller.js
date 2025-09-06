const Ticket = require('../models/ticket.model');

function parsePayload(payload) {
  const parts = Object.fromEntries(
    payload.split('|').map((kv) => kv.split(':'))
  );
  return { eventId: parts.EV, ticketId: parts.TK };
}

exports.scan = async (req, res, next) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ message: 'Missing payload' });
    const { eventId, ticketId } = parsePayload(payload);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.event.toString() !== eventId)
      return res.status(400).json({ valid: false, message: 'Invalid ticket' });
    if (ticket.status === 'checked_in')
      return res.json({ valid: true, ticketStatus: 'already_checked_in' });

    ticket.status = 'checked_in';
    await ticket.save();
    res.json({
      valid: true,
      ticketStatus: 'checked_in',
      checkedInAt: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
};
