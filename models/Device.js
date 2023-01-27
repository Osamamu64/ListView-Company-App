const mongoose = require('mongoose');

var deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    passwrod: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    ip_address: {
        type: String,
        required: true,
    },
    server: {
        type: String,
        required: true,
    }

});

module.exports = mongoose.model('Device', deviceSchema);