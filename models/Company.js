const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose)

const companySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    device_id: [{
        type: mongoose.Schema.Types.ObjectId, // relationship to device
        ref: 'Device'
    }],
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
    version: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true,
        enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm al-Quwain']
    },
    contact: {
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        }
    }
});

companySchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Company', companySchema);