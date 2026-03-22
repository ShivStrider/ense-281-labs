// User Schema
// ENSE 281 - Lab 9
// Author: Shivam Soni
//
// Mongoose schema for the User model.
// Uses passport-local-mongoose to handle password hashing
// and salting automatically. No plain password field needed!

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// the plugin adds hashed password, salt, and helper methods
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
