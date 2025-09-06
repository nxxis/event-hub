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
