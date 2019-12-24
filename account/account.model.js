const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    email: { type: String, index: true, required: true, unique: true, lowercase: true },
    name: { type: String },
    phoneNo: { type: String },
    nationalCode: { type: String },
    addrress: { type: String },
    postalCode: { type: String}
});

const walletSchema = new Schema({
    profileID: { type: Object, index: true, required: true, unique: true, lowercase: true },
    value: { type: Number }
});


profileSchema.set('toJSON', { virtuals: true });
walletSchema.set('toJSON', { virtuals: true });

var Profile = mongoose.model('Profile', profileSchema);
var Wallet = mongoose.model('Wallet', walletSchema);

module.exports = {
    Profile : Profile,
    Wallet : Wallet
};