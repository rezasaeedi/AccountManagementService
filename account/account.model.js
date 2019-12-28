const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    email: { type: String, index: true, required: true, unique: true, lowercase: true },
    name: { type: String },
    phoneNo: { type: String },
    nationalCode: { type: String },
    address: { type: String },
    postalCode: { type: String }
});

const walletSchema = new Schema({
    profileID: { type: Object, index: true, required: true, unique: true, lowercase: true },
    value: { type: Number }
});

const transactionSchema = new Schema({
    profileID: { type: Object, index: true, required: true },
    createdAt: { type: Date },
    modifiedAt: { type: Date },
    amount: { type: Number },
    orderID: { type: String },
    statusCode: { type: Number },
    refID: { type: String }
});

profileSchema.set('toJSON', { virtuals: true });
walletSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toJSON', { virtuals: true });

var Profile = mongoose.model('Profile', profileSchema);
var Wallet = mongoose.model('Wallet', walletSchema);
var Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
    Profile: Profile,
    Wallet: Wallet,
    Transaction: Transaction
};