﻿const config = require('../config.json');
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
    create,
    update

};


async function create(userParam, res) {
    //add authenticate
    console.log("authServiceURL:" + authServiceURL);

    request.post({
        url: authServiceURL + '/user/register',
        form: { email: userParam.email, password: userParam.password }
    }, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            Account.Profile.findOne({ 'email': userParam.email }, async function (err, result) {
                if (err || result != null) {
                    res.status(400).json({ message: 'Email ' + userParam.email + ' is already taken' });
                }
                else {
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
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    Account.Profile.findOne({ 'email': userParam.email }, function (err, result) {
                        console.log(result);
                        if (!err && result != null) {
                            console.log("enter wallet save...");
                            const newWallet = new Account.Wallet({
                                profileID: result._id,
                                value: 0
                            });
                            //save wallet
                            newWallet.save();
                        }
                    });

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
            });

        }
        else {
            res.status(response.statusCode).json(response.statusMessage);
        }
    });



}

function update(req, res) {
    const userParam = req.body;
    console.log('Enetr upate....');
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer 
    console.log('Token: ' + token);
    if (token) {
        request({
            method: "GET",
            uri: authServiceURL + "/user/role",
            headers: { 'Authorization': 'Bearer ' + token }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var jsonBody = JSON.parse(body);
                var email = jsonBody["email"];
                console.log("Email: " + email);
                Account.Profile.findOne({ 'email': email }, function (err, result) {

                    if (!err && result != null) {

                        var newvalues = {
                            $set: {
                                name: userParam.name,
                                phoneNo: userParam.phoneNo,
                                nationalCode: userParam.nationalCode,
                                address: userParam.address,
                                postalCode: userParam.postalCode
                            }
                        };

                        // save profile
                        Account.Profile.updateOne({ 'email': email }, newvalues, function (err, result) {
                            if (!err && result != null) {
                                Account.Profile.findOne({ 'email': email }, function (err, result) {
                                    if (!err && result != null) {
                                        res.status(200).json({ profile: result });
                                    }
                                    else
                                        res.status(400).json({ message: err });

                                });
                            }
                            else
                                res.status(400).json({ message: err });
                        });

                    } else {
                        res.status(400).json({ message: 'Email ' + email + 'not found' });

                    }
                });

            } else {
                res.status(response.statusCode).json(response.statusMessage);
            }
        });
    }
    else {
        res.status(400).json('Invalid request');
    }


}

