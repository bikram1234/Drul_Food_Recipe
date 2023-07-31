const mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    postTitle: String,
    image: String,
    description: String,
    profilepic: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        name: String,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }, ],
});

module.exports = mongoose.model("Post", postSchema);