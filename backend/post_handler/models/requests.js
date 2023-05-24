const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    ppeProfiles: { type: [], required: true },
    status: { type: String, required: true },
        // address: {type: String, required: false }, 
    postalCode: { type: String, required: true },
    reportIds: { type: [], required: false }
}, { timestamps: true });

module.exports.Requests = mongoose.model('Requests', requestSchema);
