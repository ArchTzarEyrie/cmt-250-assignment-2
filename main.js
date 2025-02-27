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

window.addEventListener('load', () => {
    initServiceWorker();
});

function addCacheHandler(cacheName) {
    navigator.serviceWorker.controller.postMessage({
        type: "ADD_CACHE",
        cacheName
    });
};

document.getElementById('add-cache-button').onclick = () => {
    const cacheName = document.getElementById('cache-name-input').value;
    addCacheHandler(cacheName);
};

function deleteCacheHandler(cacheName) {
    navigator.serviceWorker.controller.postMessage({
        type: "DELETE_CACHE",
        cacheName
    });
};

document.getElementById('delete-cache-button').onclick = () => {
    const cacheName = document.getElementById('cache-name-input').value;
    deleteCacheHandler(cacheName);
};

function searchHandler(searchTerm) {
    navigator.serviceWorker.controller.postMessage({
        type: "SEARCH_CACHE",
        searchTerm
    });
};

document.getElementById('cache-search-button').onclick = () => {
    const searchTerm = document.getElementById('cache-search-input').value;
    searchHandler(searchTerm);
}

function setPageMessage(message) {
    document.getElementById('serviceworker-message-box').innerHTML = message;
};

function setCacheNames(message) {
    document.getElementById('cache-name-area').innerHTML = message;
};

function openSuccess(cacheNames) {
    console.log('[MESSAGE] Open cache message received');
    setPageMessage('');
    setCacheNames(cacheNames.join('\n'));
};

function deleteResponse(message) {
    if (message.success) {
        setPageMessage('');
        setCacheNames(message.cacheNames.join('\n'));
    } else {
        setPageMessage('Cache deletion failed, cache not found');
    }
};

function setSearchResults(message) {
    document.getElementById('search-result-area').innerHTML = message;
};

function searchResults(results) {
    setSearchResults(results.join('\n'));
};

navigator.serviceWorker.addEventListener('message', event => {
    console.log(`[MESSAGE] Main received message with type ${event.data.type}`);
    const message = event.data;
    switch (message.type) {
        case "OPEN_SUCCESS":
            openSuccess(message.cacheNames);
            break;
        case "DELETE_RESPONSE":
            deleteResponse(message);
            break;
        case "SEARCH_RESULTS":
            searchResults(message.results);
            break;
        case "CACHE_NAMES_RESPONSE":
            setCacheNames(cacheNames.join('\n'));
            break;
        default:
            setPageMessage('ERROR: Unknown Message type received from SW');
    };
});