// Note-Vote Application - Main Logic (jQuery + MVC)
// ENSE 281 - Software Engineering Management - Lab 5
// Author: Shivam Jigneshbhai Soni
// Date: February 23, 2026
//
// Description:
// Implements the Note-Vote app using the MVC pattern with jQuery.
// - Model: notes array + functions to add notes, toggle votes
// - View: renderNotes() clears and rebuilds the DOM from the model
// - Controller: event handlers for user switching, posting, voting
//
// Voting Rules:
// - If the current user wrote the note: they see the score but cannot vote
// - If the current user did NOT write the note and has NOT voted: they see
//   upvote/downvote buttons but NOT the score
// - If they upvote: upvote button turns green (btn-success), score visible
// - If they downvote: downvote button turns red (btn-danger), score visible
// - Clicking upvote again removes the upvote (toggle off, score hidden)
// - Clicking downvote again removes the downvote (toggle off, score hidden)
// - Clicking upvote when already downvoted: removes downvote, adds upvote
// - Clicking downvote when already upvoted: removes upvote, adds downvote


$(document).ready(() => {

    // MODEL 
    // Stores all application data and provides functions
    // to manipulate notes and votes.

    // The currently logged-in user (default: alice)
    let currentUser = "alice";

    // Counter for generating unique note IDs
    let nextId = 1;

    // Array of note objects (our data model)
    // Starting empty so the tester can add notes themselves
    let notes = [];

    // Adds a new note to the model using the current user as creator
    function addNote(text) {
        let note = {
            id: nextId,
            creator: currentUser,
            text: text,
            upvotedBy: [],
            downvotedBy: []
        };
        nextId++;
        notes.push(note);
    }

    // Toggles an upvote for the current user on a given note.
    // If already upvoted, removes the upvote.
    // If currently downvoted, removes the downvote and adds an upvote.
    function toggleUpvote(noteId) {
        // Find the note in the model
        let note = notes.find((n) => n.id === noteId);
        if (!note) return;

        // Check if user already upvoted
        let upIndex = note.upvotedBy.indexOf(currentUser);
        // Check if user already downvoted
        let downIndex = note.downvotedBy.indexOf(currentUser);

        if (upIndex !== -1) {
            // Already upvoted: remove the upvote (toggle off)
            note.upvotedBy.splice(upIndex, 1);
        } else {
            // Not yet upvoted: add the upvote
            note.upvotedBy.push(currentUser);

            // If they had a downvote, remove it first
            if (downIndex !== -1) {
                note.downvotedBy.splice(downIndex, 1);
            }
        }
    }

    // Toggles a downvote for the current user on a given note.
    // If already downvoted, removes the downvote.
    // If currently upvoted, removes the upvote and adds a downvote.
    function toggleDownvote(noteId) {
        // Find the note in the model
        let note = notes.find((n) => n.id === noteId);
        if (!note) return;

        // Check if user already downvoted
        let downIndex = note.downvotedBy.indexOf(currentUser);
        // Check if user already upvoted
        let upIndex = note.upvotedBy.indexOf(currentUser);

        if (downIndex !== -1) {
            // Already downvoted: remove the downvote (toggle off)
            note.downvotedBy.splice(downIndex, 1);
        } else {
            // Not yet downvoted: add the downvote
            note.downvotedBy.push(currentUser);

            // If they had an upvote, remove it first
            if (upIndex !== -1) {
                note.upvotedBy.splice(upIndex, 1);
            }
        }
    }

    // Returns the net score for a note (upvotes minus downvotes)
    function getScore(note) {
        return note.upvotedBy.length - note.downvotedBy.length;
    }


    // VIEW 
    // Responsible for rendering the model's data into the DOM.
    // Clears and rebuilds all note rows on every update.

    // Renders all notes from the model based on the current user.
    // Each note row looks different depending on whether the user
    // is the creator, has voted, or hasn't voted yet.
    function renderNotes() {
        // Remove all existing note rows (but keep the add-note row)
        $(".dynamic-note").remove();

        // Build each note row and insert before the add-note row
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            let score = getScore(note);

            // Check the current user's relationship with this note
            let isCreator = (note.creator === currentUser);
            let hasUpvoted = (note.upvotedBy.indexOf(currentUser) !== -1);
            let hasDownvoted = (note.downvotedBy.indexOf(currentUser) !== -1);
            let hasVoted = hasUpvoted || hasDownvoted;

            // Determine if the score should be visible
            // Score is visible if: user is the creator, or user has voted
            let showScore = isCreator || hasVoted;

            // Start building the note row HTML
            let row = $("<div>").addClass("note-row dynamic-note");

            // Note text (read-only input)
            let input = $("<input>")
                .attr("type", "text")
                .addClass("form-control")
                .val(note.text)
                .prop("readonly", true);
            row.append(input);

            if (isCreator) {
                // Creator: no vote buttons, just the score
                row.append($("<span>").text(score));
            } else {
                // Not the creator: show vote buttons

                // Upvote button
                let upBtn = $("<button>")
                    .addClass("btn btn-sm")
                    .text("\u2191"); // up arrow

                // Style based on vote state
                if (hasUpvoted) {
                    upBtn.addClass("btn-success");
                } else {
                    upBtn.addClass("btn-outline-secondary");
                }

                // Capture noteId in closure for the click handler
                let noteId = note.id;
                upBtn.on("click", () => {
                    toggleUpvote(noteId);
                    renderNotes();
                });

                // Downvote button
                let downBtn = $("<button>")
                    .addClass("btn btn-sm")
                    .text("\u2193"); // down arrow

                // Style based on vote state
                if (hasDownvoted) {
                    downBtn.addClass("btn-danger");
                } else {
                    downBtn.addClass("btn-outline-secondary");
                }

                downBtn.on("click", () => {
                    toggleDownvote(noteId);
                    renderNotes();
                });

                row.append(upBtn);
                row.append(downBtn);

                // Only show the score if the user has voted
                if (showScore) {
                    row.append($("<span>").text(score));
                }
            }

            // Insert the note row before the add-note row
            $("#add-note-row").before(row);
        }
    }


    // CONTROLLER
    // Connects user interactions to the model and view.
    // Handles: user switching, posting notes, voting (in renderNotes).

    // Handle user switching via the dropdown
    $(".dropdown-item").each(function () {
        $(this).on("click", (e) => {
            e.preventDefault();

            // Get the username from the data-user attribute
            let selectedUser = $(this).data("user");
            currentUser = selectedUser;

            // Update the dropdown button text
            // Capitalize first letter for display
            let displayName = currentUser.charAt(0).toUpperCase() + currentUser.slice(1);
            $("#user-dropdown-btn").text("Logged in as: " + displayName);

            // Re-render notes for the new user's perspective
            renderNotes();
        });
    });

    // Handle adding a new note
    $("#add-note-btn").on("click", () => {
        let text = $("#new-note-input").val().trim();

        // Validate: note cannot be empty
        if (text === "") {
            alert("Please enter a note.");
            return;
        }

        // Add to the model
        addNote(text);

        // Re-render the view
        renderNotes();

        // Clear the input
        $("#new-note-input").val("");
    });

    // Allow pressing Enter to add a note (convenience)
    $("#new-note-input").keypress((e) => {
        if (e.which === 13) {
            $("#add-note-btn").click();
        }
    });

});
