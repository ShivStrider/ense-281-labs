// Seed Script - Populate Database
// ENSE 281 - Lab 9
// Author: Shivam Soni
//
// This script populates the MongoDB database with starter
// users and posts. Uses User.register() from passport-local-mongoose
// so passwords are properly hashed and salted.
//
// Usage:  node seed.js
// Note:   Make sure mongod is running before executing this script!

const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");

// connect to the note-vote database
mongoose.connect("mongodb://localhost:27017/notevote");

async function seed() {
    try {
        
        // Step 1: Clear existing data so we start fresh
        
        await User.deleteMany({});
        await Post.deleteMany({});
        console.log("Cleared existing users and posts from the database.");

        
        // Step 2: Create starter users with hashed passwords
        //         User.register() handles the salting and hashing
        
        const userA = await User.register(
            new User({ username: "a@a.a" }),
            "aPassword"
        );

        const userB = await User.register(
            new User({ username: "b@b.b" }),
            "bPassword"
        );

        console.log("Saved starter users:");
        console.log("  -", userA.username, "(id:", userA._id + ")");
        console.log("  -", userB.username, "(id:", userB._id + ")");

        
        // Step 3: Create starter posts (from posts.json)
        //         Using references to the saved User documents
        
        const posts = [
            {
                text: "First post by User1, no votes",
                creator: userA._id,
                upvotes: [],
                downvotes: []
            },
            {
                text: "Second post by User1, upvoted by User2",
                creator: userA._id,
                upvotes: [userB._id],
                downvotes: []
            },
            {
                text: "Third post by User1, downvoted by User2",
                creator: userA._id,
                upvotes: [],
                downvotes: [userB._id]
            },
            {
                text: "Fourth post by User2, no votes",
                creator: userB._id,
                upvotes: [],
                downvotes: []
            },
            {
                text: "Fifth post by User2, upvoted by User1",
                creator: userB._id,
                upvotes: [userA._id],
                downvotes: []
            },
            {
                text: "Sixth post by User2, downvoted by User1",
                creator: userB._id,
                upvotes: [],
                downvotes: [userA._id]
            }
        ];

        const savedPosts = await Post.insertMany(posts);
        console.log("\nSaved", savedPosts.length, "starter posts:");
        for (const p of savedPosts) {
            console.log("  - [" + p._id + "]", p.text);
        }

        
        // Done
        
        console.log("\nDatabase seeded successfully!");

    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        // close the connection when finished
        mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

seed();
