// ============================================================
// Burn After Reading - Main Application Logic
// ENSE 281 - Software Engineering Management - Lab 4
// Author: Shivam
// Date: February 2026
//
// Description:
// Implements the sticky notes app using the MVC pattern.
// - Model: stores notes in an array, provides add/remove functions
// - View: clears and re-renders all notes from the model on every change
// - Controller: listens for button clicks and coordinates model + view
//
// Extra Credit:
// Notes cycle through 5 rotating colors based on their position index.
// Because the view re-renders from scratch each time, deleting a note
// does not shift the colors of the remaining notes unexpectedly.
//
// Key Concepts Used:
// - DOM manipulation (createElement, appendChild, innerHTML)
// - Event listeners with addEventListener
// - The bind() method to pass note ID into the burn button callback
// - Array filter() for removing notes from the model
// - Template literals are avoided to keep things simple for now


// MODEL 
// The model holds all application data (the notes array)
// and provides functions to modify that data.

// Array to store all sticky note objects
let notes = [];

// Counter for generating unique IDs (increments with each new note)
let nextId = 1;

// Five rotating colors for sticky notes (from the lab spec)
const NOTE_COLORS = [
    "#ff7eb9",  // pink
    "#ff65a3",  // hot pink
    "#7afcff",  // cyan
    "#feff9c",  // light yellow
    "#fff740"   // bright yellow
];

// Adds a new note object to the notes array.
// Each note has a unique id, a title, and text content.
// @param {string} title - the note's title
// @param {string} text - the note's body content
function addNote(title, text) {
    let note = {
        id: nextId,
        title: title,
        text: text
    };
    nextId++;
    notes.push(note);
}

// Removes a note from the notes array by its unique ID.
// Uses Array.filter() to keep only notes that don't match the given ID.
// @param {number} id - the unique ID of the note to remove
function removeNote(id) {
    notes = notes.filter(function (note) {
        return note.id !== id;
    });
}


//  VIEW 
// The view is responsible for displaying the model's data in the DOM.
// On every change, we clear the entire view and rebuild it from the model.
// This keeps the view in sync with the model at all times.

// Clears all note cards from the display container.
// Called before re-rendering to avoid duplicate elements.
function clearView() {
    let container = document.getElementById("notes-container");
    container.innerHTML = "";
}

// Renders all notes from the model to the DOM.
//
// Steps:
// 1. Clear the current view (remove all existing cards)
// 2. Loop through the notes array
// 3. For each note, create a Bootstrap card with the rotating color
// 4. Attach a burn button with an event listener to delete that note
//
// Color assignment:
// Colors rotate by position index (i % 5), so the first note
// is always pink, the second is hot pink, the third is cyan, etc.
function renderNotes() {
    // Step 1: clear existing notes from the page
    clearView();

    let container = document.getElementById("notes-container");

    // Step 2: loop through all notes in the model
    for (let i = 0; i < notes.length; i++) {
        let note = notes[i];

        // Pick the color based on position (rotating through 5 colors)
        let color = NOTE_COLORS[i % NOTE_COLORS.length];

        // Create the Bootstrap column wrapper (3 notes per row on medium+ screens)
        let col = document.createElement("div");
        col.classList.add("col-md-4", "mb-3");

        // Create the card element and apply the background color
        let card = document.createElement("div");
        card.classList.add("card", "sticky-note");
        card.style.backgroundColor = color;

        // Create the card body to hold title, text, and burn button
        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        // Create and set the note title
        let cardTitle = document.createElement("h5");
        cardTitle.classList.add("card-title");
        cardTitle.innerText = note.title;

        // Create and set the note text
        let cardText = document.createElement("p");
        cardText.classList.add("card-text");
        cardText.innerText = note.text;

        // Create the burn button with a fire emoji icon
        let burnBtn = document.createElement("button");
        burnBtn.classList.add("burn-btn");
        burnBtn.innerText = "\uD83D\uDD25"; // fire emoji

        // Attach click listener to the burn button
        // bind() passes the note's ID as "this" inside the callback
        // so we know which note to remove from the model
        burnBtn.addEventListener("click", function () {
            removeNote(this);   // "this" is the note ID thanks to bind()
            renderNotes();      // re-render the view after removing
        }.bind(note.id));

        // Assemble the card: title -> text -> burn button -> card body -> card -> column
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(burnBtn);
        card.appendChild(cardBody);
        col.appendChild(card);

        // Add the completed note card to the container
        container.appendChild(col);
    }
}


//  CONTROLLER 
// The controller connects user actions (button clicks) to
// the model (data) and view (display). It reads form input,
// validates it, updates the model, and triggers the view to re-render.

// Get references to the form elements
let postBtn = document.getElementById("post-btn");
let noteTitleInput = document.getElementById("note-title");
let noteTextInput = document.getElementById("note-text");

// Listen for clicks on the Post button
postBtn.addEventListener("click", function () {
    // Read and trim the form values
    let title = noteTitleInput.value.trim();
    let text = noteTextInput.value.trim();

    // Validate: both fields must have content
    if (title === "" || text === "") {
        alert("Please fill in both the title and the note.");
        return;
    }

    // Add the new note to the model
    addNote(title, text);

    // Re-render the view to show the new note
    renderNotes();

    // Clear the form inputs for the next note
    noteTitleInput.value = "";
    noteTextInput.value = "";
});