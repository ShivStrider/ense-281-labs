// Post (Note) Schema
// ENSE 281 - Lab 9
// Author: Shivam Soni
//
// Mongoose schema for the Post model.
// Each post has text content, a creator (reference to User),
// and arrays of upvotes and downvotes (references to Users).

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    text:      { type: String, required: true },
    creator:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
