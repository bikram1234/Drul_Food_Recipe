require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_CONNECTION, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('DataBase connection Successful')
});
require('./userModel');