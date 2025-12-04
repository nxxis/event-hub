const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.post('/create', requireAuth, requireRole(['admin']), ctrl.createByAdmin);

module.exports = router;
