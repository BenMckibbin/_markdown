/**
 * Project: _markdown (Bookmark Manager API)
 * Description: A lightweight Node.js Express server with a local SQLite database.
 *              This API handles saving, retrieving, and managing bookmarks.
 * Technologies: Node.js, Express.js, SQLite3, CORS
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Initialize the Express application
const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
// cors(): Allows our future front-end to safely communicate with this back-end
app.use(cors());
// express.json(): Automatically parses incoming JSON data from requests
app.use(express.json());
app.use(express.static('public'));
// Serve the shared assets folder from one directory up
app.use('/shared', express.static(path.join(__dirname, '../shared_assets')));

// --- DATABASE INITIALIZATION ---
// Create or connect to a local SQLite file named 'database.sqlite'
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
    
    // Create the Bookmarks table if it doesn't exist already
    // id: Auto-incrementing primary key
    // title: The name of the bookmark
    // url: The web link
    // tags: A comma-separated string of tags (e.g., "tutorial,code")
    db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT,
        tags TEXT
    )`);
  }
});


// --- API ENDPOINTS ---

// 1. Base Route (Test route to ensure the server is responding)
app.get('/', (req, res) => {
  res.send('_markdown (Bookmark Manager) API is running!');
});

// 2. GET /bookmarks (Retrieve all saved bookmarks)
app.get('/bookmarks', (req, res) => {
  // Query the database for all rows in the 'bookmarks' table
  db.all("SELECT * FROM bookmarks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Send the resulting rows back to the client as JSON
    res.json(rows);
  });
});

// 3. POST /bookmarks (Save a new bookmark)
app.post('/bookmarks', (req, res) => {
  // Extract the title, url, and tags from the incoming request body
  const { title, url, tags } = req.body;
  
  // SQL query using '?' placeholders to prevent SQL injection attacks
  const sql = "INSERT INTO bookmarks (title, url, tags) VALUES (?, ?, ?)";
  
  // Execute the query, passing in our extracted variables
  db.run(sql, [title, url, tags], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Respond with the newly created bookmark, including its generated database ID
    res.json({ 
      id: this.lastID, 
      title: title, 
      url: url, 
      tags: tags 
    });
  });
});

// 4. DELETE: Remove a bookmark by its ID
app.delete('/bookmarks/:id', (req, res) => {
  const id = req.params.id;
  
  const sql = "DELETE FROM bookmarks WHERE id = ?";
  
  db.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // this.changes tells us how many rows were deleted
    if (this.changes === 0) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    res.json({ message: "Bookmark deleted successfully" });
  });
});


// --- START SERVER ---
// Tell the Express app to listen for network requests on our defined port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});