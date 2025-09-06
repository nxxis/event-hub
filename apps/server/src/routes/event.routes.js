const router = require('express').Router();
const ctrl = require('../controllers/event.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/ics', ctrl.ics);

router.post('/', requireAuth, requireRole(['organiser', 'admin']), ctrl.create);
router.put(
  '/:id',
  requireAuth,
  requireRole(['organiser', 'admin']),
  ctrl.update
);
router.post(
  '/:id/publish',
  requireAuth,
  requireRole(['organiser', 'admin']),
  ctrl.publish
);
router.delete(
  '/:id',
  requireAuth,
  requireRole(['organiser', 'admin']),
  ctrl.remove
);

module.exports = router;
