const form = document.getElementById('addForm');
const bookmarkList = document.getElementById('bookmarkList');

// 1. Fetch and display existing bookmarks when the page loads
async function loadBookmarks() {
    const response = await fetch('/bookmarks');
    const bookmarks = await response.json();
    
    // Clear the list first
    bookmarkList.innerHTML = '';
    
    // Loop through each bookmark and add it to the page
    bookmarks.forEach(displayBookmark);
}

// Helper function to create the HTML for a single bookmark
// Helper function to create the HTML for a single bookmark
function displayBookmark(bookmark) {
    const div = document.createElement('div');
    div.className = 'card';
    // We added a wrapper div with flexbox to align the text and button side-by-side
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <h4 style="margin: 0 0 0.5rem 0;">
                    <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.title}</a>
                </h4>
                <small style="color: #666;">Tags: ${bookmark.tags || 'none'}</small>
            </div>
            <button onclick="deleteBookmark(${bookmark.id}, this)" style="background-color: #dc2626; width: auto; padding: 0.5rem 1rem;">Delete</button>
        </div>
    `;
    bookmarkList.prepend(div);
}

// Function to delete a bookmark
async function deleteBookmark(id, buttonElement) {
    // Confirm before deleting
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    // Send the DELETE request to the server
    const response = await fetch('/bookmarks/' + id, {
        method: 'DELETE'
    });

    if (response.ok) {
        // Remove the card from the screen visually
        const card = buttonElement.closest('.card');
        card.remove();
    } else {
        alert('Failed to delete the bookmark.');
    }
}

// Call the function immediately to load data
loadBookmarks();

// 2. Handle form submission to save a new bookmark
form.addEventListener('submit', async (e) => {
    // Stop the browser from reloading the page
    e.preventDefault();

    // Gather the data from the input fields
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const tags = document.getElementById('tags').value;

    // Send the POST request to the server
    const response = await fetch('/bookmarks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // Convert our JavaScript object into a JSON string
        body: JSON.stringify({ title, url, tags })
    });

    if (response.ok) {
        const newBookmark = await response.json();
        
        // Display the new bookmark instantly
        displayBookmark(newBookmark);
        
        // Clear the form fields
        form.reset();
    } else {
        alert('Failed to save the bookmark.');
    }
});