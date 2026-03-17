// Note-Vote Server
// ENSE 281 - Lab 6
// Author: Shivam Soni
// Date: March 2026

const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

// serve static files (css, js) from the public folder
app.use(express.static("public"));

// parse form data from POST requests
app.use(express.urlencoded({ extended: true }));

// GET "/" - send the login page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// POST "/app" - check login credentials then serve the app or reject
app.post("/app", (req, res) => {
    // grab the email and password from the submitted form
    let email = req.body["login-email"];
    let password = req.body["login-password"];

    // read the users file and check credentials
    fs.readFile(__dirname + "/users.json", "utf8", (err, jsonString) => {
        if (err) {
            console.log("Error reading users file:", err);
            res.redirect("/");
            return;
        }

        // parse the JSON into an array of user objects
        let users = JSON.parse(jsonString);

        // look for a matching username and password
        let match = users.find((user) => {
            return user.username === email && user.password === password;
        });

        if (match) {
            // credentials are valid, send the app page
            console.log("Login success:", email);
            res.sendFile(__dirname + "/todo.html");
        } else {
            // credentials are invalid, send them back to login
            console.log("Login failed:", email);
            res.send(`
                <h2>Invalid username or password.</h2>
                <a href="/">Go back to login</a>
            `);
        }
    });
});

// start the server
app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});
