const express = require('express');
const router = express.Router();
const accountService = require('./account.service');

module.exports = router;

// routes
router.get('/heartbeat', heartbeat);
router.post('/profile', registerProfile);

function registerProfile(req, res, next) {
    accountService.create(req.body, res);
}

function heartbeat(req, res, netx) {
    res.status(200).json({ message: 'Account Management is up and running' });
}
