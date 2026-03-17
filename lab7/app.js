// Note-Vote Server with EJS Templates
// ENSE 281 - Software Engineering Management - Lab 7
// Author: Shivam Soni
// Date: March 2026
//
// Description:
// Express server for the Note-Vote application. Uses EJS for
// templating instead of jQuery front-end logic. All voting,
// posting and auth logic is handled server-side. Data is stored
// in JSON files (users.json, posts.json).

const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

// ============================================================
// Middleware Setup
// ============================================================

// serve static files (css) from the public folder
app.use(express.static("public"));

// parse form data from POST requests
// must come before any route definitions
app.use(express.urlencoded({ extended: true }));

// set EJS as the view engine
app.set("view engine", "ejs");

// ============================================================
// Helper Functions - Read/Write JSON
// ============================================================

// reads the users array from users.json
function loadUsers() {
    let data = fs.readFileSync(__dirname + "/users.json", "utf8");
    return JSON.parse(data);
}

// writes the users array to users.json
function saveUsers(users) {
    fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users, null, 4));
}

// reads the posts array from posts.json
function loadPosts() {
    let data = fs.readFileSync(__dirname + "/posts.json", "utf8");
    return JSON.parse(data);
}

// writes the posts array to posts.json
function savePosts(posts) {
    fs.writeFileSync(__dirname + "/posts.json", JSON.stringify(posts, null, 4));
}

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
app.post("/login", (req, res) => {
    let username = req.body["login-email"];
    let password = req.body["login-password"];

    // load the current user list from JSON
    let users = loadUsers();

    // look for a matching username
    let foundUser = users.find((u) => u.username === username);

    if (!foundUser) {
        // no user with that username
        res.send('<h2>No account found with that email.</h2><a href="/">Go back</a>');
        return;
    }

    if (foundUser.password !== password) {
        // password doesn't match
        res.send('<h2>Incorrect password.</h2><a href="/">Go back</a>');
        return;
    }

    // credentials valid - redirect to note-vote with POST data
    res.redirect(307, "/note-vote");
});

// POST "/register" - create a new user and redirect to note-vote
app.post("/register", (req, res) => {
    let username = req.body["login-email"];
    let password = req.body["login-password"];
    let inviteCode = req.body["invite-code"];

    // check the invite code
    if (inviteCode !== INVITE_CODE) {
        res.send('<h2>Invalid invite code.</h2><a href="/">Go back</a>');
        return;
    }

    // load current users
    let users = loadUsers();

    // check if username already exists
    let existing = users.find((u) => u.username === username);
    if (existing) {
        res.send('<h2>A user with that email already exists.</h2><a href="/">Go back</a>');
        return;
    }

    // create the new user and save
    let newUser = { username: username, password: password };
    users.push(newUser);
    saveUsers(users);

    console.log("New user registered:", username);

    // redirect to note-vote with POST data
    res.redirect(307, "/note-vote");
});

// POST "/note-vote" - render the main note-vote page
app.post("/note-vote", (req, res) => {
    // grab the logged-in username from POST data
    let username = req.body["login-email"];

    // load the posts from JSON
    let posts = loadPosts();

    // render the note-vote page, passing in username and posts
    res.render("note-vote", { username: username, posts: posts });
});

// GET "/logout" - go back to the login page
app.get("/logout", (req, res) => {
    res.redirect("/");
});

// POST "/addpost" - add a new post and redirect back
app.post("/addpost", (req, res) => {
    let username = req.body["login-email"];
    let text = req.body["post-text"];

    // load current posts
    let posts = loadPosts();

    // find the next available id
    let maxId = 0;
    for (let i = 0; i < posts.length; i++) {
        if (posts[i]._id > maxId) {
            maxId = posts[i]._id;
        }
    }

    // create the new post
    let newPost = {
        _id: maxId + 1,
        text: text,
        creator: { username: username, password: "" },
        upvotes: [],
        downvotes: []
    };

    posts.push(newPost);
    savePosts(posts);

    console.log("New post added by:", username);

    // redirect back to note-vote (307 keeps POST data)
    res.redirect(307, "/note-vote");
});

// POST "/upvote" - upvote a post (user has not voted yet)
app.post("/upvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    // load posts, find the target post
    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // add the user to upvotes
        post.upvotes.push({ username: username, password: "" });
        savePosts(posts);
    }

    // redirect back to note-vote
    res.redirect(307, "/note-vote");
});

// POST "/downvote" - downvote a post (user has not voted yet)
app.post("/downvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // add the user to downvotes
        post.downvotes.push({ username: username, password: "" });
        savePosts(posts);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-upvote" - remove an existing upvote
app.post("/remove-upvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // remove the user from upvotes
        post.upvotes = post.upvotes.filter((u) => u.username !== username);
        savePosts(posts);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-downvote" - remove an existing downvote
app.post("/remove-downvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // remove the user from downvotes
        post.downvotes = post.downvotes.filter((u) => u.username !== username);
        savePosts(posts);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-upvote-and-downvote" - switch from upvote to downvote
app.post("/remove-upvote-and-downvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // remove the upvote
        post.upvotes = post.upvotes.filter((u) => u.username !== username);
        // add a downvote
        post.downvotes.push({ username: username, password: "" });
        savePosts(posts);
    }

    res.redirect(307, "/note-vote");
});

// POST "/remove-downvote-and-upvote" - switch from downvote to upvote
app.post("/remove-downvote-and-upvote", (req, res) => {
    let username = req.body["login-email"];
    let postId = parseInt(req.body["post-id"]);

    let posts = loadPosts();
    let post = posts.find((p) => p._id === postId);

    if (post) {
        // remove the downvote
        post.downvotes = post.downvotes.filter((u) => u.username !== username);
        // add an upvote
        post.upvotes.push({ username: username, password: "" });
        savePosts(posts);
    }

    res.redirect(307, "/note-vote");
});

// ============================================================
// Start the Server
// ============================================================

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});
