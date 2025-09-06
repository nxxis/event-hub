const router = require('express').Router();
const ctrl = require('../controllers/ticket.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post(
  '/:eventId/rsvp',
  requireAuth,
  requireRole(['student', 'organiser', 'admin']),
  ctrl.rsvp
);
router.get('/me', requireAuth, ctrl.mine);
router.get('/:ticketId/qr', requireAuth, ctrl.qrImage);
router.post('/:ticketId/cancel', requireAuth, ctrl.cancel);

module.exports = router;
