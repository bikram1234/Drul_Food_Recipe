const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require('../models/userModel');
const nodemailer = require('nodemailer');


// mail sender details
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.auth_user,
        pass: process.env.auth_pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SERECT,
            callbackURL: "http://localhost:3000/auth/google/landing",
            passReqToCallback: true
        },
        async(request, accessToken, refreshToken, profile, done) => {


            try {
                let existingUser = await User.findOne({ google_id: profile.id });
                // if user exists return the user 
                if (existingUser) {
                    console.log('user exits');
                    return done(null, existingUser);

                }
                // if user does not exist create a new user 

                console.log('Creating new user...');
                const newUser = new User({
                    google_id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    picture: profile.picture
                });
                await newUser.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("this is " + newUser.name);
                        var mailOptions = {
                            from: "Druk Food Recipe",
                            to: newUser.email,
                            subject: "Druk Food Recipe - First time registering",
                            html: "<h2>Hello " + newUser.name + ", \nThanks for registering on our Website.</h2>"
                        };

                        //sending mail
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log("email" + error);
                            } else {
                                console.log("First time registration Mail is sent to your gmail account");
                                res.render("login", {
                                    successMessage: "Thanks for registering on our Website."
                                });
                            }
                        });
                    }
                });
                return done(null, newUser);


            } catch (error) {
                return done(error, false)
            }
        }
    ));
}