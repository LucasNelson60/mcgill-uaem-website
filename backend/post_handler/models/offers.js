const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    ppeProfiles: { type: [], required: true },
    status: { type: String, required: true },
    // address: {type: String, required: false }, 
    postalCode: { type: String, required: true },
    reportIds: { type: [], required: false }
}, { timestamps: true });

module.exports.Offers = mongoose.model('Offers', offerSchema);
