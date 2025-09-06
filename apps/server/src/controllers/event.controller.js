const Event = require('../models/event.model');

const { createEvent } = require('ics');

exports.ics = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const ev = await Event.findById(id).populate('organisation', 'name');
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const s = new Date(ev.startAt),
      e = new Date(ev.endAt);
    createEvent(
      {
        title: ev.title,
        description: ev.description,
        location: ev.venue,
        start: [
          s.getFullYear(),
          s.getMonth() + 1,
          s.getDate(),
          s.getHours(),
          s.getMinutes(),
        ],
        end: [
          e.getFullYear(),
          e.getMonth() + 1,
          e.getDate(),
          e.getHours(),
          e.getMinutes(),
        ],
        organizer: {
          name: ev.organisation?.name || 'EventHub',
          email: 'no-reply@example.com',
        },
        status: 'CONFIRMED',
      },
      (err, value) => {
        if (err) return next(err);
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${ev.title}.ics"`
        );
        res.send(value);
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { search = '', tag, org, startFrom } = req.query;
    const q = { status: 'published', visibility: 'public' };
    if (search) q.title = { $regex: search, $options: 'i' };
    if (tag) q.tags = tag;
    if (org) q.organisation = org;
    if (startFrom) q.startAt = { $gte: new Date(startFrom) };
    const items = await Event.find(q)
      .sort({ startAt: 1 })
      .limit(100)
      .populate('organisation', 'name');
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await Event.findById(req.params.id).populate(
      'organisation',
      'name'
    );
    if (!item) return res.status(404).json({ message: 'Event not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = req.body;
    body.organisation = req.user.organisation || body.organisation;
    const item = await Event.create(body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: 'Event not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.publish = async (req, res, next) => {
  try {
    const item = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Event not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const ok = await Event.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
};
