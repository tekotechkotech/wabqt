const express = require('express');
const router = express.Router();
const { connectWa, sendWa } = require('./controller');

router.get('/connect', connectWa);
router.post('/send', sendWa);

module.exports = router;
