const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
var request = require('request');
var ObjectId = require('mongodb').ObjectID;
//var request = require('./await-request')
const authServiceIP = config.authServiceIP;
const authServicePort = config.authServicePort;
const authServiceURL = "http://" + authServiceIP + ":" + authServicePort + "/auth/v1";
const Account = db.Account;

const ZarinpalCheckout = require('zarinpal-checkout');
/**
 * Create ZarinPal
 * @param {String} `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` [Merchant ID]
 * @param {Boolean} false [toggle `Sandbox` mode]
 */
const zarinpal = ZarinpalCheckout.create('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', true);

module.exports = {
    create,
    update,
    getProfile,
    getWallet,
    getTransaction,
    pay,
    verify
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

function getProfile(req, res) {
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
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
                        res.status(200).json({ profile: result });
                    }
                    else
                        res.status(400).json({ message: err });
                });
            }
        });
    }
    else {
        res.status(400).json('Invalid request');
    }
}

function getWallet(req, res) {

    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
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
                        const profileID = result.id;
                        console.log('profileID: ' + profileID);
                        Account.Wallet.findOne({ 'profileID': new ObjectId(profileID) }, function (err, result) {
                            if (!err && result != null) {
                                res.status(200).json({ wallet: result });
                            }
                            else {
                                res.status(400).json({ message: err });
                            }
                        });
                    }
                    else
                        res.status(400).json({ message: err });
                });
            }
        });
    }
    else {
        res.status(400).json('Invalid request');
    }

}

function getTransaction(req, res) {

    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
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
                        const profileID = result.id;
                        console.log('profileID: ' + profileID);
                        Account.Transaction.find({ 'profileID': new ObjectId(profileID) }, function (err, result) {
                            if (!err && result != null) {
                                console.log('here... ');
                                res.status(200).json(result);
                            }
                            else {
                                console.log(result);
                                res.status(400).json({ message: err });
                            }
                        });
                    }
                    else
                        res.status(400).json({ message: err });
                });
            }
        });
    }
    else {
        res.status(400).json('Invalid request');
    }

}

function getEmailByToken(req, result, err) {
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
    if (token) {
        request({
            method: "GET",
            uri: authServiceURL + "/user/role",
            headers: { 'Authorization': 'Bearer ' + token }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var jsonBody = JSON.parse(body);
                var email = jsonBody["email"];
                //await new Promise(resolve => setTimeout(resolve, 1200));
                result = email;
                console.log('1' + email);
                return;
                console.log('1');
            }
            else {
                var err = {
                    statusCode: statusCode,
                    message: response.message
                };
                console.log('2');
            }
        });
    }
    else {
        var err = {
            statusCode: 400,
            message: 'Invalid request'
        };
        console.log('3');
    }
}

function pay(req, res) {
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
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
                        const profileID = result.id;
                        const tel = result.phoneNo;
                        console.log('profileID: ' + profileID);
                        Account.Transaction.findOne({ 'profileID': new ObjectId(profileID), 'orderID': req.orderID }, function (err, result) {
                            if (!err && result != null) {
                                console.log(result);

                                /**
                             * PaymentRequest [module]
                             * @return {String} URL [Payement Authority]
                             */
                                console.log("enter zarinpal...");
                                zarinpal.PaymentRequest({
                                    Amount: result.amount, // In Tomans
                                    CallbackURL: 'https://your-safe-api/example/zarinpal/validate',
                                    Description: 'A Payment from Node.JS',
                                    Email: email,
                                    Mobile: tel
                                }).then(response => {
                                    if (response.status === 100) {
                                        console.log(response.url);
                                        res.redirect(response.url);
                                    }
                                }).catch(err => {
                                    console.error(err);
                                });


                            }
                            else {
                                console.log(result);
                                res.status(400).json({ message: err });
                            }
                        });
                    }
                    else
                        res.status(400).json({ message: err });
                });
            }
        });
    }
    else {
        res.status(400).json('Invalid request');
    }
}


function verify(req, res){
    zarinpal.PaymentVerification({
        Amount: '1000', // In Tomans
        Authority: req.query.authority,
      }).then(response => {
        if (response.status !== 100) {
          console.log('Empty!');
        } else {
          console.log(`Verified! Ref ID: ${response.RefID}`);
        }
      }).catch(err => {
        console.error(err);
      });
}