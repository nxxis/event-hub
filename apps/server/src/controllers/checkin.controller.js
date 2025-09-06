const Ticket = require('../models/ticket.model');
const { verify } = require('../utils/sign');

function parseData(data) {
  const parts = Object.fromEntries(data.split('|').map((kv) => kv.split(':')));
  return { eventId: parts.EV, ticketId: parts.TK };
}

exports.scan = async (req, res, next) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ message: 'Missing payload' });

    // verify signature
    const data = verify(payload);
    if (!data)
      return res
        .status(400)
        .json({ valid: false, message: 'Invalid signature' });

    const { eventId, ticketId } = parseData(data);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.event.toString() !== eventId) {
      return res.status(400).json({ valid: false, message: 'Invalid ticket' });
    }
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
