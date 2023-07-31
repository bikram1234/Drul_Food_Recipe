const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require('../models/postModel');

const middleware = require('../controller/userMiddleware');
const { query } = require("express");

router.get("/:name", (req, res) => {
    //   Get all posts from DB
    Post.find({ "author.name": req.params.name }, (err, allposts) => {
        if (err) {
            console.log("Error in find");
            console.log(err);
        } else {
            console.log(allposts);
            res.render("posts/mypost", {
                posts: allposts.reverse(),
                currentUser: req.user,
            });
        }
    });
});

module.exports = router;