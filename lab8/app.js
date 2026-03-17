// Note-Vote Server with MongoDB/Mongoose
// ENSE 281 - Software Engineering Management - Lab 8
// Author: Shivam Soni
// Date: March 2026
//
// Description:
// Express server for the Note-Vote application. Uses EJS for
// templating. All voting, posting and auth logic is handled
// server-side. Data is stored in MongoDB via Mongoose.
//
// Make sure mongod is running and the database is seeded
// before starting: node seed.js

const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");

const app = express();
const port = 3000;

// ============================================================
// Database Connection
// ============================================================

mongoose.connect("mongodb://localhost:27017/notevote");

// ============================================================
// Middleware Setup
// ============================================================

// serve static files (css) from the public folder
app.use(express.static("public"));

// parse form data from POST requests
app.use(express.urlencoded({ extended: true }));

// set EJS as the view engine
app.set("view engine", "ejs");

// ============================================================
// Invite Code (constant for registration)
// ============================================================

const INVITE_CODE = "Note Vote 2026";

// ============================================================
// Routes
// ============================================================

// GET "/" - render the login/register page
app.get("/", (req, res) => {
    res.render("index");
});

// POST "/login" - check credentials and redirect to note-vote
app.post("/login", async (req, res) => {
    let username = req.body["login-email"];
    let password = req.body["login-password"];

    try {
        // look for a matching user in the database
        let foundUser = await User.findOne({ username: username });

        if (!foundUser) {
            res.send('<h2>No account found with that email.</h2><a href="/">Go back</a>');
            return;
        }

        if (foundUser.password !== password) {
            res.send('<h2>Incorrect password.</h2><a href="/">Go back</a>');
            return;
        }

        // credentials valid - redirect to note-vote with POST data
        res.redirect(307, "/note-vote");
    } catch (error) {
        console.log(error);
        res.send('<h2>Server error.</h2><a href="/">Go back</a>');
    }
});

// POST "/register" - create a new user and redirect to note-vote
app.post("/register", async (req, res) => {
    let username = req.body["login-email"];
    let password = req.body["login-password"];
    let inviteCode = req.body["invite-code"];

    // check the invite code
    if (inviteCode !== INVITE_CODE) {
        res.send('<h2>Invalid invite code.</h2><a href="/">Go back</a>');
        return;
    }

    try {
        // check if username already exists
        let existing = await User.findOne({ username: username });
        if (existing) {
            res.send('<h2>A user with that email already exists.</h2><a href="/">Go back</a>');
            return;
        }

        // create the new user and save to database
        let newUser = new User({ username: username, password: password });
        await newUser.save();

        console.log("New user registered:", username);

        // redirect to note-vote with POST data
        res.redirect(307, "/note-vote");
    } catch (error) {
        console.log(error);
        res.send('<h2>Server error.</h2><a href="/">Go back</a>');
    }
});

// POST "/note-vote" - render the main note-vote page
app.post("/note-vote", async (req, res) => {
    let username = req.body["login-email"];

    try {
        // load all posts from the database, populating creator and vote refs
        let posts = await Post.find()
            .populate("creator")
            .populate("upvotes")
            .populate("downvotes");

        // convert to plain objects so EJS can use them like before
        let postsForEJS = posts.map((p) => {
            return {
                _id: p._id,
                text: p.text,
                creator: { username: p.creator.username, password: "" },
                upvotes: p.upvotes.map((u) => ({ username: u.username, password: "" })),
                downvotes: p.downvotes.map((u) => ({ username: u.username, password: "" }))
            };
        });

        // render the note-vote page, passing in username and posts
        res.render("note-vote", { username: username, posts: postsForEJS });
    } catch (error) {
        console.log(error);
        res.send('<h2>Server error.</h2><a href="/">Go back</a>');
    }
});

// GET "/logout" - go back to the login page
app.get("/logout", (req, res) => {
    res.redirect("/");
});

// POST "/addpost" - add a new post and redirect back
app.post("/addpost", async (req, res) => {
    let username = req.body["login-email"];
    let text = req.body["post-text"];

    try {
        // find the user in the database
        let user = await User.findOne({ username: username });

        // create the new post
        let newPost = new Post({
            text: text,
            creator: user._id,
            upvotes: [],
            downvotes: []
        });

        await newPost.save();
        console.log("New post added by:", username);
    } catch (error) {
        console.log(error);
    }

    // redirect back to note-vote (307 keeps POST data)
    res.redirect(307, "/note-vote");
});

// POST "/upvote" - upvote a post
app.post("/upvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, { $push: { upvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// POST "/downvote" - downvote a post
app.post("/downvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, { $push: { downvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-upvote" - remove an existing upvote
app.post("/remove-upvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, { $pull: { upvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-downvote" - remove an existing downvote
app.post("/remove-downvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, { $pull: { downvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-upvote-and-downvote" - switch from upvote to downvote
app.post("/remove-upvote-and-downvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, {
            $pull: { upvotes: user._id },
            $push: { downvotes: user._id }
        });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-downvote-and-upvote" - switch from downvote to upvote
app.post("/remove-downvote-and-upvote", async (req, res) => {
    let username = req.body["login-email"];
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: username });
        await Post.updateOne({ _id: postId }, {
            $pull: { downvotes: user._id },
            $push: { upvotes: user._id }
        });
    } catch (error) {
        console.log(error);
    }

    res.redirect(307, "/note-vote");
});

// ============================================================
// Start the Server
// ============================================================

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});
