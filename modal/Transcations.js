const mongoose = require('mongoose');

const Transcation = new mongoose.Schema({
    token: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    time: {
        type: Date,
        require: true,
        default: Date.now()
    },
    tamount: {
        type: Number,
        require: true
    }

})

module.exports = new mongoose.model('Trans', Transcation);