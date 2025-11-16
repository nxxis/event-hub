const Event = require('../models/event.model');
const Ticket = require('../models/ticket.model');
const mongoose = require('mongoose');

const { createEvent } = require('ics');
const axios = require('axios');

exports.ics = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    // Ensure the requesting user actually has a ticket for this event
    const ticket = await Ticket.findOne({
      event: id,
      user: req.user && req.user.id,
      status: { $in: ['active', 'checked_in'] },
    });
    if (!ticket)
      return res
        .status(403)
        .json({ message: 'Must have a ticket to download calendar' });

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
        // sanitize filename (basic): remove path-breaking characters
        const safeTitle = (ev.title || 'event').replace(/[^a-z0-9 _\-]/gi, '');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${safeTitle}.ics"`
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

// Generate or return images for the event. If OPENAI_API_KEY is present the server
// will attempt to generate images using the OpenAI Image API. Otherwise we return
// seeded Picsum.photos URLs as a fallback so the frontend always gets usable images.
exports.images = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const ev = await Event.findById(id).populate('organisation', 'name');
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // determine prompt from the event data
    const promptParts = [ev.title, ev.description, ev.tags && ev.tags.join(', '), ev.organisation?.name];
    const prompt = `Hero-style photograph for an event: ${promptParts.filter(Boolean).join(' • ')} — bright, modern, high-resolution, people at an event, stage, banners, natural lighting.`;

    // If an OpenAI key is provided, attempt to generate images (n=3)
    if (process.env.OPENAI_API_KEY) {
      try {
        const url = 'https://api.openai.com/v1/images/generations';
        const payload = {
          model: 'gpt-image-1',
          prompt,
          n: 3,
          size: '1024x1024',
        };
        const resp = await axios.post(url, payload, {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        });

        // The image API may return data or urls depending on provider. Normalize to an array of URLs.
        const images = [];
        if (resp.data && resp.data.data) {
          for (const item of resp.data.data) {
            if (item.url) images.push(item.url);
            else if (item.b64_json) images.push(`data:image/png;base64,${item.b64_json}`);
          }
        }
        if (images.length) return res.json({ images });
      } catch (err) {
        // fall through to fallback below but log the error for dev visibility
        console.error('OpenAI image generation failed:', err.message || err);
      }
    }

    // Fallback: return seeded picsum.photos images using event id as seed so results are stable
    const seedBase = ev._id.toString().slice(-8);
    const fallback = [600, 800, 400].map((w, i) => `https://picsum.photos/seed/${encodeURIComponent(seedBase + i)}/${w}/600`);
    res.json({ images: fallback });
  } catch (e) {
    next(e);
  }
};
