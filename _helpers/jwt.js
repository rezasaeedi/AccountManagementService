const expressJwt = require('express-jwt');
const config = require('config.json');
const accountService = require('../account/account.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            {url:'/account/heartbeat', methods: ['GET']},
            {url:'/account/profile',  methods: ['POST']},
            {url:'/account/pay/callback',  methods: ['GET']}
        ]
    });
}

async function isRevoked(req, payload, done) {
    console.log('Enetr upate....');
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer 
    console.log('Token: ' + token);
    const user = await accountService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};