const express = require("express");
const app = express();
const User = require('./server/models/userModel');
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require('express-session');
const methodOverride = require('method-override');
app.use(bodyParser.json())


const port = process.env.PORT || 2000;



app.use(express.static(__dirname + '/public'));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));




app.use(
    require("express-session")({
        secret: "little secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
const adminRoutes = require('./server/routes/admin')

const routes = require('./server/routes/drukRecipeRoute')
const route = require('./server/routes/comments')
const userRoutes = require('./server/routes/mypost')
app.use("/:id/comments", route);
app.use("/mypost", userRoutes);
app.use("/admin", adminRoutes);

app.use('/', routes);

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})