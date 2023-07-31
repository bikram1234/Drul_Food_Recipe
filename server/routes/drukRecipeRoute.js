require('../models/mongooseConn');
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const passport = require("passport");
require("../controller/passportConfig")(passport);
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel')
const middleware = require('../controller/userMiddleware');
var fs = require('fs');
var path = require('path');

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(file);
        cb(null, 'public/images/upload')
        console.log(__dirname);
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


//----------------User Controller-------------//

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        console.log(user);
        done(err, user);
    });
});
router.get("/login", userController.login);
router.get("/register", userController.register);



//------------Google auth----------------------//


router.get('/auth/google/landing',
    passport.authenticate('google', { failureRedirect: "/login" }),
    function(req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect("/");
    });
router.get('/auth/google', passport.authenticate("google", { scope: ["email", "profile"] }));

//----------------------Logout-----------------------------------------//
router.get("/logout", (req, res) => {
    req.logOut((err) => {});
    res.redirect('/')
});


//----------------------About Us----------------------//
router.get('/about', (req, res) => {
    res.render("aboutus", { currentUser: req.user });

})

//----------------------Post Controlller----------------------//


//-----------------------------Fetching the post from Data Base----------------//
router.get("/", (req, res) => {
    Post.find({}, (err, allposts) => {
        if (err) {
            res.redirect('/')

        } else {
            res.render('landing', {
                posts: allposts.reverse(),
                currentUser: req.user,
            });
        }
    });
});

//CREATE- add new post to DB
router.post("/newPost", middleware.isLoggedIn, upload.single('image'), (req, res, next) => {
    // add new post
    var name = req.body.name;
    var desc = req.body.description;
    var image = req.file.filename
    var profilepic = req.user.picture

    console.log("THis is pics" + profilepic);

    var author = {
        id: req.user._id,
        name: req.user.name,
    };

    var newPost = {
        postTitle: name,
        image: image,
        description: desc,
        author: author,
        profilepic: profilepic
    };
    //Save to database
    Post.create(newPost, (err, newlyCreated) => {
        if (err) {
            console.log("Error in inserting into DB");
        } else {
            res.redirect('/');
        }
    });
});

//NEW - show form to create new posts
router.get("/newPost", middleware.isLoggedIn, (req, res) => {
    res.render('posts/newPost', { currentUser: req.user });
});

//SHOW - render show template with given id
router.get("/:id", function(req, res) {
    //find the post with provided id
    Post.findById(req.params.id)
        .populate("comments")
        .exec((err, foundPost) => {
            if (err) {
                console.log(err);
            } else {

                //render show template with that post
                res.render('posts/showIndividual', { posts: foundPost, currentUser: req.user });

                console.log(foundPost);
            }
        });
});

//=================EDIT POST ROUTE=====================
router.get("/:id/edit", middleware.checkPostOwnership, (req, res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        res.render("posts/edit_post", { post: foundPost, currentUser: req.user });
    });
});

//UPDATE POST ROUTE
router.put("/:id", middleware.checkPostOwnership, (req, res) => {
    //find and update
    Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedPost) => {
        console.log('this is ' + updatedPost);
        if (err) {
            console.log(err);
        } else {
            res.redirect("/mypost/" + updatedPost.author.name);
        }
    });
});

//DESTROY POST ROUTE

router.delete("/:id", middleware.checkPostOwnership, (req, res) => {

    Post.findByIdAndRemove(req.params.id, (err, foundPost) => {
        if (err) {
            res.redirect("/");
        } else {


            const path = "public/images/upload/" + foundPost.image;
            fs.unlink(path, (err) => {
                if (err) {
                    console.error(err);

                }

                console.log("File removed");
            });
            res.redirect("/mypost/" + req.user.name);
        }
    });
});



module.exports = router;