const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({


    google_id: {
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    picture: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now()
    }

});
module.exports = mongoose.model('User', userSchema);