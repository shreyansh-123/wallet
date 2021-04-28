const mongoose = require('mongoose');

const users = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    token: {
        type: String,
        require: true
    },
    balance: {
        type: Number,
        require: true,
        default: 1
    }
})

module.exports = new mongoose.model('user', users);