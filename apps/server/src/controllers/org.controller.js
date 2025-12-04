const Organisation = require('../models/organisation.model');

exports.list = async (req, res, next) => {
  try {
    const items = await Organisation.find({ approved: true }).select(
      'name description'
    );
    res.json(items);
  } catch (e) {
    next(e);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const item = await Organisation.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
    if (!item)
      return res.status(404).json({ message: 'Organisation not found' });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

// Create a new organisation (organiser or admin)
exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const exists = await Organisation.findOne({ name });
    if (exists)
      return res.status(409).json({ message: 'Organisation already exists' });

    const owner = req.user && req.user.id;
    if (!owner) return res.status(401).json({ message: 'Unauthorized' });

    const org = await Organisation.create({
      name,
      description: description || '',
      owner,
    });
    res.status(201).json(org);
  } catch (e) {
    next(e);
  }
};

// Return organisations owned by the current user
exports.mine = async (req, res, next) => {
  try {
    const owner = req.user && req.user.id;
    if (!owner) return res.status(401).json({ message: 'Unauthorized' });
    const items = await Organisation.find({ owner }).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
};

// Admin-only: list all organisations (for approval)
exports.adminList = async (req, res, next) => {
  try {
    const items = await Organisation.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    next(e);
  }
};

// Admin-only: remove (reject) an organisation
exports.remove = async (req, res, next) => {
  try {
    const ok = await Organisation.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Organisation not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
};
