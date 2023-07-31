const mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    usercomment: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        name: String,
        profilepic: String
    },
});

module.exports = mongoose.model("Comment", commentSchema);