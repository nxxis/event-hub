const router = require('express').Router();
const ctrl = require('../controllers/org.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get(
  '/mine',
  requireAuth,
  requireRole(['organiser', 'admin']),
  ctrl.mine
);
router.get('/admin', requireAuth, requireRole(['admin']), ctrl.adminList);
router.get('/', ctrl.list);
router.post('/', requireAuth, requireRole(['organiser', 'admin']), ctrl.create);
router.post('/:id/approve', requireAuth, requireRole(['admin']), ctrl.approve);
router.delete('/:id', requireAuth, requireRole(['admin']), ctrl.remove);

module.exports = router;
