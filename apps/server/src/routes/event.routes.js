const router = require('express').Router();
const ctrl = require('../controllers/event.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/images', ctrl.images);
router.post('/:id/images/regenerate', requireAuth, requireRole(['organiser', 'admin']), ctrl.regenerateImages);
router.get('/:id/ics', requireAuth, ctrl.ics);

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
