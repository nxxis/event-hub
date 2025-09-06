const router = require('express').Router();
const ctrl = require('../controllers/org.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', ctrl.list);
router.post('/:id/approve', requireAuth, requireRole(['admin']), ctrl.approve);

module.exports = router;
