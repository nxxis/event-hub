const Event = require('../models/event.model');
const Ticket = require('../models/ticket.model');
const mongoose = require('mongoose');
const Organisation = require('../models/organisation.model');

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

    // If the user is an organiser, find their organisation
    if (req.user.role === 'organiser') {
      const org = await Organisation.findOne({ owner: req.user.id });
      if (!org) {
        return res.status(400).json({
          message: 'Organiser must have an organisation to create events',
        });
      }
      body.organisation = org._id;
    } else {
      // For admins or if organisation is provided
      body.organisation = req.user.organisation || body.organisation;
    }

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

// Admin-only: list events with participant counts
exports.adminList = async (req, res, next) => {
  try {
    const items = await Event.find({})
      .sort({ startAt: 1 })
      .populate('organisation', 'name');

    // Count active/checked_in tickets per event
    const agg = await Ticket.aggregate([
      { $match: { status: { $in: ['active', 'checked_in'] } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const map = {};
    for (const a of agg) map[a._id.toString()] = a.count;

    const out = items.map((ev) => {
      const obj = ev.toObject ? ev.toObject() : ev;
      return { ...obj, participantCount: map[ev._id.toString()] || 0 };
    });
    res.json(out);
  } catch (e) {
    next(e);
  }
};

// Organiser: list events for organisation(s) owned by the current user
exports.organiserList = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Find organisations owned by this user
    const orgs = await Organisation.find({ owner: userId }).select('_id');
    if (!orgs || orgs.length === 0) return res.json([]);
    const orgIds = orgs.map((o) => o._id);

    const items = await Event.find({ organisation: { $in: orgIds } })
      .sort({ startAt: 1 })
      .populate('organisation', 'name');

    res.json(items);
  } catch (e) {
    next(e);
  }
};

// Admin-only: list attendees for a single event
exports.attendees = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid event id' });

    // If organiser requests attendees, ensure they own the event (via organisation.owner)
    if (req.user && req.user.role === 'organiser') {
      const ev = await Event.findById(id).populate('organisation', 'owner');
      if (!ev) return res.status(404).json({ message: 'Event not found' });
      const orgOwner = ev.organisation && ev.organisation.owner;
      if (!orgOwner || orgOwner.toString() !== (req.user.id || req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const items = await Ticket.find({
      event: id,
      status: { $in: ['active', 'checked_in'] },
    }).populate('user', 'name email');

    // return a lightweight attendee list
    const out = items.map((t) => ({
      ticketId: t._id,
      status: t.status,
      issuedAt: t.issuedAt,
      user: t.user
        ? { _id: t.user._id, name: t.user.name, email: t.user.email }
        : null,
    }));
    res.json(out);
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

    // If images were previously generated and stored, return cached images first
    if (ev.images && Array.isArray(ev.images) && ev.images.length) {
      return res.json({ images: ev.images });
    }

    // Delegate to generator logic (same used by regenerate endpoint)
    async function generateAndSaveImages(forceStyle) {
      const parts = [];
      if (ev.title) parts.push(ev.title);
      if (ev.description) parts.push(ev.description.substring(0, 200));
      if (ev.tags && ev.tags.length) parts.push(ev.tags.join(', '));
      if (ev.organisation && ev.organisation.name)
        parts.push(ev.organisation.name);
      const content = parts.filter(Boolean).join(' • ');
      const style = forceStyle || ev.imageStyle || 'photorealistic';
      const styleNote =
        style === 'illustration'
          ? 'illustration style, vector-friendly, clean shapes'
          : style === 'cinematic'
          ? 'cinematic, dramatic lighting, film look'
          : 'photorealistic';
      const prompt = `Create a high-quality, hero-style ${style} image for an event described as: ${content}. Style notes: ${styleNote}. Focus on people and activity that represent the event. No logos or watermarks. Provide images suitable for website hero banners (16:9).`;

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

          const images = [];
          if (resp.data && resp.data.data) {
            for (const item of resp.data.data) {
              if (item.url) images.push(item.url);
              else if (item.b64_json)
                images.push(`data:image/png;base64,${item.b64_json}`);
            }
          }

          if (images.length) {
            try {
              ev.images = images;
              await ev.save();
            } catch (saveErr) {
              console.warn(
                'Failed to save generated images on event:',
                saveErr.message || saveErr
              );
            }
            return images;
          }
        } catch (err) {
          console.error('OpenAI image generation failed:', err.message || err);
        }
      }

      // Fallback
      const seedBase = ev._id.toString().slice(-8);
      const fallback = [1200, 900, 600].map(
        (w, i) =>
          `https://picsum.photos/seed/${encodeURIComponent(
            seedBase + '-' + i
          )}/${w}/600`
      );
      try {
        ev.images = fallback;
        await ev.save();
      } catch (saveErr) {
        console.warn(
          'Failed to save fallback images on event:',
          saveErr.message || saveErr
        );
      }
      return fallback;
    }

    const images = await generateAndSaveImages();
    res.json({ images });
  } catch (e) {
    next(e);
  }
};

// Force regenerate images for an event (admin/organiser only)
exports.regenerateImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event id' });
    }
    const ev = await Event.findById(id).populate('organisation', 'name');
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // Clear existing images and generate new ones using the event's imageStyle
    ev.images = [];
    await ev.save();

    // reuse generation logic from images handler by calling generateAndSaveImages via local copy
    // implement inline generation similar to above
    const parts = [];
    if (ev.title) parts.push(ev.title);
    if (ev.description) parts.push(ev.description.substring(0, 200));
    if (ev.tags && ev.tags.length) parts.push(ev.tags.join(', '));
    if (ev.organisation && ev.organisation.name)
      parts.push(ev.organisation.name);
    const content = parts.filter(Boolean).join(' • ');
    const style = ev.imageStyle || 'photorealistic';
    const styleNote =
      style === 'illustration'
        ? 'illustration style, vector-friendly, clean shapes'
        : style === 'cinematic'
        ? 'cinematic, dramatic lighting, film look'
        : 'photorealistic';
    const prompt = `Create a high-quality, hero-style ${style} image for an event described as: ${content}. Style notes: ${styleNote}. Focus on people and activity that represent the event. No logos or watermarks. Provide images suitable for website hero banners (16:9).`;

    let images = [];
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
        if (resp.data && resp.data.data) {
          for (const item of resp.data.data) {
            if (item.url) images.push(item.url);
            else if (item.b64_json)
              images.push(`data:image/png;base64,${item.b64_json}`);
          }
        }
      } catch (err) {
        console.error(
          'OpenAI image generation failed (regenerate):',
          err.message || err
        );
      }
    }
    if (!images.length) {
      const seedBase = ev._id.toString().slice(-8);
      images = [1200, 900, 600].map(
        (w, i) =>
          `https://picsum.photos/seed/${encodeURIComponent(
            seedBase + '-' + i
          )}/${w}/600`
      );
    }

    try {
      ev.images = images;
      await ev.save();
    } catch (saveErr) {
      console.warn(
        'Failed to save regenerated images on event:',
        saveErr.message || saveErr
      );
    }
    res.json({ images });
  } catch (e) {
    next(e);
  }
};
