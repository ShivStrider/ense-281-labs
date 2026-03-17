// User Schema
// ENSE 281 - Lab 8
// Author: Shivam Soni
//
// Mongoose schema for the User model.
// Each user has a username (email) and a password.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
