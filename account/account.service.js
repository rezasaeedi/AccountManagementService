const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
var request = require('request');
//var request = require('./await-request')
const authServiceIP = config.authServiceIP;
const authServicePort = config.authServicePort;
const authServiceURL = "http://" + authServiceIP + ":" + authServicePort + "/auth/v1";
const Account = db.Account;

module.exports = {
    create
};


async function create(userParam, res) {
    //add authenticate
    console.log("authServiceURL:" + authServiceURL);

    request.post({
        url: authServiceURL + '/user/register',
        form: { email: userParam.email, password: userParam.password }
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            Account.Profile.findOne({ 'email': userParam.email }, function (err, result) {
                if (err || result != null) {
                    res.status(400).json({ message: 'Email ' + userParam.email + ' is already taken' });
                    return;
                }
            });

            const newProfile = new Account.Profile({
                email: userParam.email,
                name: userParam.name,
                phoneNo: userParam.phoneNo,
                nationalCode: userParam.nationalCode,
                addrress: userParam.address,
                postalCode: userParam.postalCode
            });

            // save profile
            newProfile.save();
            //login to auth
            request.post({
                url: authServiceURL + '/user/login',
                form: { email: userParam.email, password: userParam.password }
            }, async function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var jsonBody = JSON.parse(body);
                    var token = jsonBody["token"];
                    res.status(200).json({ token: token });
                }
            });
        }
        else {
            res.status(response.statusCode).json(response.statusMessage);
        }
    });



}

