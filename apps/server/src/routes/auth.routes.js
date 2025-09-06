const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
