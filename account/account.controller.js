const express = require('express');
const router = express.Router();
const accountService = require('./account.service');
const jwt = require('_helpers/jwt');

module.exports = router;

// routes
router.get('/heartbeat', heartbeat);
router.post('/profile', registerProfile);
router.put('/profile', updateProfile);

function registerProfile(req, res, next) {
    accountService.create(req.body, res);
}

function heartbeat(req, res, netx) {
    res.status(200).json({ message: 'Account Management is up and running'});
}

function updateProfile(req, res) {
    accountService.update(req, res);
}
