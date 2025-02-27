// Standard initialization of service worker
function initServiceWorker() {
    console.log('[LIFECYCLE] Initializing main file');
    navigator.serviceWorker
        .register('./serviceworker.js')
        .then(() => console.log('[LIFECYCLE] Service worker registered'))
        .catch((error) => {
            console.log('[ERROR] Error during service worker registration');
            console.log(error);
        });
}

// Initialize our service worker on window load and
// send a message to the SW asking for all current cache names
window.addEventListener('load', () => {
    initServiceWorker();
    navigator.serviceWorker.controller.postMessage({
        type: "GET_CACHE_NAMES"
    });
});

// When the "Open Cache" button is clicked:
// Post a message to our service worker to open a cache 
// with the name supplied from the input field
document.getElementById('add-cache-button').onclick = () => {
    const cacheName = document.getElementById('cache-name-input').value;
    navigator.serviceWorker.controller.postMessage({
        type: "ADD_CACHE",
        cacheName
    });
};

// When the "Delete Cache" button is clicked:
// Post a message to our service worker to delete the cache
// with the name supplied from the input field
document.getElementById('delete-cache-button').onclick = () => {
    const cacheName = document.getElementById('cache-name-input').value;
    navigator.serviceWorker.controller.postMessage({
        type: "DELETE_CACHE",
        cacheName
    });
};

// When the "Search Cache" button is clicked:
// Post a message to our service worker to search default cache
// with the search time supplied from the input field
document.getElementById('cache-search-button').onclick = () => {
    const searchTerm = document.getElementById('cache-search-input').value;
    navigator.serviceWorker.controller.postMessage({
        type: "SEARCH_CACHE",
        searchTerm
    });
}

// set text underneath the cache name input box with helpful information
function setPageMessage(message) {
    document.getElementById('serviceworker-message-box').innerHTML = message;
};

// populate the first enclosed area on the page with the supplied cache names
function setCacheNames(message) {
    document.getElementById('cache-name-area').innerHTML = message;
};

// Message listener for our main file to receive messages from the SW
navigator.serviceWorker.addEventListener('message', event => {
    console.log(`[MESSAGE] Main received message with type ${event.data.type}`);
    const message = event.data;
    // This switch statement handles the different types of responses we can 
    // receive from the SW
    switch (message.type) {
        // This occurs after a cache is opened and:
        // Resets the info message
        // Prints all the cache names received from the SW
        case "OPEN_SUCCESS": 
            setPageMessage('');
            setCacheNames(message.cacheNames.join('\n'));
            break;
        // This occurs after a cache deletion is requested and:
        // if the deletion was successful, we clear the info message and print the new list of cache names
        // if the deletion failed, we set the info message to state this
        case "DELETE_RESPONSE":
            if (message.success) {
                setPageMessage('');
                setCacheNames(message.cacheNames.join('\n'));
            } else {
                setPageMessage('Cache deletion failed, cache not found');
            }
            break;
        // This occurs after a cache search, and 
        // prints the search results in the lower enclosed area
        case "SEARCH_RESULTS":
            document.getElementById('search-result-area').innerHTML = message.results.join('\n');
            break;
        // This occurs only on load to populate the top enclosed
        // area for cache names with the defaultCache name
        case "CACHE_NAMES_RESPONSE":
            setCacheNames(message.cacheNames.join('\n'));
            break;
        default:
            setPageMessage('ERROR: Unknown Message type received from SW');
    };
});