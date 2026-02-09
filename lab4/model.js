// Note-Vote Model - Data Model for the Note-Vote App
// ENSE 281 - Software Engineering Management - Lab 4 (Part 2)
// Author: Shivam
// Date: February 8, 2026
//
// Description:
// Defines the data model for the Note-Vote application using
// JavaScript Object Notation (JSON). Each note is an object
// stored in an array, representing a note that users can upvote
// or downvote. This model will be connected to a view in Lab 5.
//
// Note Object Structure:
// - id (number):          unique identifier for each note
// - creator (string):     username of the person who created the note
// - text (string):        the note's content
// - upvotedBy (array):    list of usernames who upvoted
// - downvotedBy (array):  list of usernames who downvoted
// - createdAt (string):   ISO 8601 timestamp of when the note was created
//
// Usage:
// Open this file in a browser console or link it to an HTML file.
// Call displayNotes() to print all notes and their scores.



// HELPER FUNCTIONS 
// Array of 3 sample notes following the Note-Vote schema.
// Each note tracks who voted on it (not just a count),
// which prevents duplicate votes in the future.

let noteVoteModel = [
    {
        id: 1,
        creator: "shivam",
        text: "We should add a dark mode toggle to the app for better accessibility.",
        upvotedBy: ["alice", "bob", "charlie"],
        downvotedBy: ["dave"],
        createdAt: "2026-02-05T10:30:00"
    },
    {
        id: 2,
        creator: "alice",
        text: "The weekly standup meetings could be shortened to 10 minutes.",
        upvotedBy: ["shivam", "dave"],
        downvotedBy: ["bob", "charlie"],
        createdAt: "2026-02-06T14:15:00"
    },
    {
        id: 3,
        creator: "bob",
        text: "Let us use Bootstrap 5 for the frontend instead of writing custom CSS from scratch.",
        upvotedBy: ["shivam", "alice", "charlie", "dave"],
        downvotedBy: [],
        createdAt: "2026-02-07T09:45:00"
    }
];


// HELPER FUNCTIONS 

// Calculates the net vote score for a given note.
// Score = number of upvotes minus number of downvotes.
// @param {object} note - a note object from the noteVoteModel array
// @returns {number} the net score (can be negative)
function getScore(note) {
    return note.upvotedBy.length - note.downvotedBy.length;
}

// Prints all notes and their details to the console.
// Useful for verifying the model is set up correctly
// before connecting it to a view in Lab 5.
function displayNotes() {
    for (let note of noteVoteModel) {
        console.log("Note #" + note.id + " by " + note.creator);
        console.log("  Text: " + note.text);
        console.log("  Upvotes: " + note.upvotedBy.length + " | Downvotes: " + note.downvotedBy.length);
        console.log("  Score: " + getScore(note));
        console.log("  Created: " + note.createdAt);
        console.log("---");
    }
}


// RUN 
// Display all notes in the console to verify the model
displayNotes();