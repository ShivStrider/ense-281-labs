// Note-Vote Server with Passport Authentication
// ENSE 281 - Software Engineering Management - Lab 9
// Author: Shivam Soni
// Date: March 2026
//
// Description:
// Express server for the Note-Vote application. Uses Passport
// for authentication with salted/hashed passwords, sessions
// for tracking logged-in users, and dotenv for storing secrets.
// Data is stored in MongoDB via Mongoose.
//
// Make sure mongod is running and the database is seeded
// before starting: node seed.js

const express = require("express");
const mongoose = require("mongoose");


// Require Auth Dependencies


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();


// App and Port Setup


const app = express();
const port = 3000;

// parse form data from POST requests
app.use(express.urlencoded({ extended: true }));


// Session Setup

// the secret is used to sign the session id cookie
// resave: false = don't re-save session if nothing changed
// saveUninitialized: false = don't save empty sessions

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

// initialize passport and hook it into the session
app.use(passport.initialize());
app.use(passport.session());


// View Engine and Static Files


app.set("view engine", "ejs");
app.use(express.static("public"));


// Database Connection


mongoose.connect("mongodb://localhost:27017/notevote")
    .then(() => { console.log("Connected to MongoDB"); });


// Models


const User = require("./models/User");
const Post = require("./models/Post");


// Passport Strategy

// passport-local-mongoose handles the local strategy for us
// serialize/deserialize controls how user data is stored in
// and read from the session cookie

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Routes


// GET "/" - render the login/register page
app.get("/", (req, res) => {
    res.render("index");
});

// POST "/register" - create a new user with passport
app.post("/register", async (req, res) => {
    console.log("User " + req.body.username + " is attempting to register");

    // check the invite code from the .env file
    if (req.body["invite-code"] !== process.env.INVITE_CODE) {
        res.send('<h2>Invalid invite code.</h2><a href="/">Go back</a>');
        return;
    }

    try {
        // passport-local-mongoose hashes and salts the password for us
        const user = new User({ username: req.body.username });
        await User.register(user, req.body.password);

        // authenticate and start a session right after registering
        passport.authenticate("local")(req, res, () => {
            res.redirect("/note-vote");
        });
    } catch (error) {
        console.log(error);
        res.send('<h2>Registration failed. User may already exist.</h2><a href="/">Go back</a>');
    }
});

// POST "/login" - authenticate an existing user with passport
app.post("/login", (req, res) => {
    console.log("User " + req.body.username + " is attempting to log in");

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/note-vote");
            });
        }
    });
});

// GET "/note-vote" - the main page (protected, requires auth)
app.get("/note-vote", async (req, res) => {
    console.log("A user is accessing /note-vote and...");

    if (req.isAuthenticated()) {
        console.log("was authorized: " + req.user.username);

        try {
            // load all posts with populated user references
            let posts = await Post.find()
                .populate("creator")
                .populate("upvotes")
                .populate("downvotes");

            // convert to plain objects so EJS can work with them
            let postsForEJS = posts.map((p) => {
                return {
                    _id: p._id,
                    text: p.text,
                    creator: { username: p.creator.username },
                    upvotes: p.upvotes.map((u) => ({ username: u.username })),
                    downvotes: p.downvotes.map((u) => ({ username: u.username }))
                };
            });

            res.render("note-vote", {
                username: req.user.username,
                posts: postsForEJS
            });
        } catch (error) {
            console.log(error);
            res.send('<h2>Server error.</h2><a href="/">Go back</a>');
        }
    } else {
        console.log("was not authorized.");
        res.redirect("/");
    }
});

// GET "/logout" - end the session and redirect to login
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});


// Post and Vote Routes (all protected by session)

// since the user is tracked in the session via req.user,
// we no longer need hidden "login-email" inputs in forms

// POST "/addpost" - add a new post
app.post("/addpost", async (req, res) => {
    let username = req.user.username;
    let text = req.body["post-text"];

    try {
        let user = await User.findOne({ username: username });

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

    res.redirect("/note-vote");
});

// POST "/upvote" - upvote a post
app.post("/upvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, { $push: { upvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});

// POST "/downvote" - downvote a post
app.post("/downvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, { $push: { downvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});

// POST "/remove-upvote" - remove an existing upvote
app.post("/remove-upvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, { $pull: { upvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});

// POST "/remove-downvote" - remove an existing downvote
app.post("/remove-downvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, { $pull: { downvotes: user._id } });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});

// POST "/remove-upvote-and-downvote" - switch from upvote to downvote
app.post("/remove-upvote-and-downvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, {
            $pull: { upvotes: user._id },
            $push: { downvotes: user._id }
        });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});

// POST "/remove-downvote-and-upvote" - switch from downvote to upvote
app.post("/remove-downvote-and-upvote", async (req, res) => {
    let postId = req.body["post-id"];

    try {
        let user = await User.findOne({ username: req.user.username });
        await Post.updateOne({ _id: postId }, {
            $pull: { downvotes: user._id },
            $push: { upvotes: user._id }
        });
    } catch (error) {
        console.log(error);
    }

    res.redirect("/note-vote");
});


// Start the Server


app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});
