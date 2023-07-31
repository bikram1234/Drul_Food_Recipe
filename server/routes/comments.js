const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Comment = require('../models/commentModel')
const middleware = require('../controller/userMiddleware');

router.get("/newcomment", middleware.isLoggedIn, (req, res) => {
    //Find Post by ID
    Post.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/newcomment", { post: post, currentUser: req.user });
        }
    });
});
router.post("/", middleware.isLoggedIn, (req, res) => {
    //lookup for post using id
    Post.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    console.log(req.user);
                    comment.author.name = req.user.name;
                    comment.author.profilepic = req.user.picture;
                    //save comment
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/" + post._id);
                }
            });
        }
    });
});

//Edit Comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership,
    (req, res) => {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/editcomment", {
                    post_id: req.params.id,
                    comment: foundComment,
                    currentUser: req.user
                });
            }
        });
    }
);

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(
        req.params.comment_id,
        req.body.comment,
        (err, updatedComment) => {
            if (err) {
                console.log("here");
                res.redirect("back");
            } else {
                res.redirect("/" + req.params.id);
            }
        }
    );
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("/" + req.params.id);
        } else {
            res.redirect("/" + req.params.id);
        }
    });
});

module.exports = router;