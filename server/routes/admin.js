const findOrCreate = require('mongoose-findorcreate');
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel')
const Adminmiddleware = require('../controller/adminMiddleware');
var fs = require('fs');
var path = require('path');



const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    profile: String,
    date: {
        type: Date,
        default: Date.now()
    }

});
AdminSchema.plugin(findOrCreate);
AdminSchema.plugin(passportLocalMongoose);


const AdminModel = mongoose.model("Admin", AdminSchema);

passport.use(AdminModel.createStrategy());



passport.serializeUser(function(AdminModel, done) {
    done(null, AdminModel);
});

passport.deserializeUser(function(AdminModel, done) {
    done(null, AdminModel);
});








router.get("/", (req, res) => {
        res.render("adminlogin")
    })
    .get("/register", (req, res) => {
        res.render("adminregister")
    })


.post("/register", (req, res) => {
        AdminModel.register({ username: req.body.username, name: req.body.name, profile: req.body.pic }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register")

            } else {
                passport.authenticate("local")(req, res, () => {
                    res.send("Registered ")
                })

            }
        })

    })
    .get('/dashboard', Adminmiddleware.isLoggedIn, (req, res) => {
        User.find({}, (err, allposts) => {
            if (err) {
                res.redirect('/admin')

            } else {
                res.render('adminDashboard', {
                    user: allposts.reverse(),
                    currentUser: req.user,
                });
            }
        });

    })

.post("/", (req, res) => {

    const user = new AdminModel({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err) => {
        if (err) {
            res.redirect('back')

        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/admin/dashboard')
            })

        }

    })


})

.get('/admins', Adminmiddleware.isLoggedIn, (req, res) => {

    AdminModel.find({}, (err, admin) => {
        if (err) {
            res.redirect('/admin/admins')

        } else {
            res.render('admindashboard1', {
                admins: admin.reverse(),
                currentUser: req.user,
            });
        }
    });
})

//remove the admin
.delete("/:id", Adminmiddleware.isLoggedIn, (req, res) => {


        AdminModel.findByIdAndRemove(req.params.id, (err, foundAdmin) => {
            if (err) {
                res.redirect("/admin/admins");
            } else {
                res.redirect("/admin/admins");
            }
        });
    })
    //remove the User as well as posts of user
    .delete("/dashboard/:id", Adminmiddleware.isLoggedIn, (req, res) => {
        //Finding the user if exist in collection
        if (User.find({ "_id": req.params.id }, (err, founduser) => {
                if (err) {
                    console.log("Error in find");
                    console.log(err);
                } else {
                    //finding the post that belongs to author

                    if (Post.find({ "author.id": req.params.id }, (err, foundpost) => {

                            //Deleting the post that belongs to author
                            Post.deleteMany({ "author.id": req.params.id }, (err, newfoundpost) => {
                                if (err) {
                                    console.log("Error while deleteing");
                                } else {
                                    // deleting the user 
                                    User.findByIdAndRemove(req.params.id, (err, founduser) => {
                                        if (err) {
                                            console.log("Error");
                                        }
                                        res.render('adminDashboard')
                                    })
                                }

                            })

                        }))
                        res.redirect('/admin/dashboard')

                }
            })) {

        } else {
            res.redirect('/admin/dash')
                //No such user

        }


    })

//View the post of individual user

.get('/dashboard/:id', Adminmiddleware.isLoggedIn, (req, res) => {


    if (User.find({ "_id": req.params.id }, (err, founduser) => {
            if (err) {
                console.log("Error in find");
                console.log(err);
            } else {

                Post.find({ "author.id": req.params.id }, (err, foundpost) => {

                    res.render("userposts", { founduser: founduser, foundpost: foundpost })
                    console.log("this is post" + foundpost);
                })

                console.log("THis is user" + founduser);
            }
        })) {

    } else {
        res.redirect('/admin/users')

    }
})

// .get('/dashboard/:id',Adminmiddleware.isLoggedIn,(req,res)=>{

// })


//Deleting post of user 

.delete('/users/dash/:id', Adminmiddleware.isLoggedIn, (req, res) => {


    Post.findByIdAndRemove(req.params.id, (err, foundPost) => {
        if (err) {
            res.redirect("/admin/dashboard");
        } else {


            const path = "public/images/upload/" + foundPost.image;
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);

                }

                console.log("File removed");
            });
            res.redirect("/admin/dashboard/" + foundPost.author.id);
        }
    })

})


.get("/logout", (req, res) => {
    req.logOut((err) => {});
    res.redirect('/admin')
});




module.exports = router;