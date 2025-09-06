const router = require('express').Router();
const ctrl = require('../controllers/checkin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post(
  '/scan',
  requireAuth,
  requireRole(['organiser', 'admin']),
  ctrl.scan
);

module.exports = router;
