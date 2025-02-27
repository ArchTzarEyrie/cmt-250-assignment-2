// TASK 1
// This function should return an object with the field:
// -- cacheNames: an array of all cache names as strings
async function getCacheNames() {
    console.log('[MESSAGE] Getting all cache names');
    const cacheNames = await caches.keys();
    return {
        type: "CACHE_NAMES_RESPONSE",
        cacheNames
    };
};

// TASK 2
// This function should:
// -- delete all caches
// -- open a cache with the name "defaultCache"
// -- add all files under the "cached" folder to the cache
// (namely, resource1.json, resource2.json, resource3.json)
async function setUpCaches() {
    console.log('[CACHES] Deleting all caches');
    const cacheNames = await caches.keys();
    cacheNames.forEach(async cacheName => {
        await caches.delete(cacheName);
    });
    const cache = await caches.open('defaultCache');
    console.log("[CACHES] Adding resources to defaultCache");
    await cache.addAll([
        "./cached/resource1.json",
        "./cached/deeper/resource2.json",
        "./cached/deeper/deeper/resource3.json"
    ]);
}

// TASK 3
// This function should:
// -- open a cache with the supplied "cacheName"
// return an object with the field:
// -- cacheNames: an array of all cache names as strings
async function addCache(cacheName) {
    console.log(`[MESSAGE] Opening cache with name ${cacheName}`);
    await caches.open(cacheName);
    const cacheNames = await caches.keys();
    return {
        type: "OPEN_SUCCESS",
        cacheNames
    };
};

// TASK 4
// This function should:
// -- delete a cache with the supplied "cacheName"
// return an object with the fields:
// -- success: a boolean describing if the deletion was successful or not
// -- cacheNames: an array of all cache names as strings
async function deleteCache(cacheName) {
    console.log(`[MESSAGE] Deleting cache with name ${cacheName}`);
    const success = await caches.delete(cacheName);
    const cacheNames = await caches.keys();
    return {
        type: "DELETE_RESPONSE",
        success,
        cacheNames
    };
};

// TASK 5
// This function should:
// -- search the URLs of the entries in the cache "defaultCache" for the search term
// -- (keep in mind the cache stores Request objects as keys, so you'll need to access the associated URL of each entry)
// return an object with the field:
// -- results: an array of URL strings that contain "searchTerm"
async function searchCache(searchTerm) {
    console.log(`[MESSAGE] Searching default cache for ${searchTerm}`);
    const cache = await caches.open('defaultCache');
    const keys = await cache.keys();
    const urls = keys.map(key => key.url);
    const filteredUrls = urls.filter(url => url.includes(searchTerm));
    return {
        type: "SEARCH_RESULTS",
        results: filteredUrls
    };
};


// No tasks below this point

// This function handles all messages we can expect from the main file
// You will implement each of the called functions as part of your assignment
// You will not need to edit this function
async function messageHandler(message) {
    const type = message.type;
    let response;
    switch (type) {
        case "ADD_CACHE":
            response = await addCache(message.cacheName);
            return response;
        case "DELETE_CACHE":
            response = await deleteCache(message.cacheName);
            return response;
        case "SEARCH_CACHE":
            response = await searchCache(message.searchTerm);
            return response;
        case "GET_CACHE_NAMES":
            response = await getCacheNames();
            return response;
        default:
            return {
                type: "ERROR",
                message: "[ERROR] Unknown message type provided to SW"
            };
    };
};

// Standard event listener which calls "messageHandler" to execute
// functionality, and gets a response object back. This listener then
// sends the response object back as a message to main
self.addEventListener('message', async event => {
    console.log(`[MESSAGE] SW received message with type ${event.data.type}`);
    const response = await messageHandler(event.data);
    console.log(`[MESSAGE] Responding to main with type ${response.type}`);
    event.source.postMessage(response);
});

// Standard install event handler, although it calls setUpCaches to
// standardize how our app behaves on each load
self.addEventListener('install', async (event) => {
    console.log('[LIFECYCLE] Service worker installed');
    event.waitUntil(setUpCaches());
    self.skipWaiting();
});

// Standard activate event handler
self.addEventListener('activate', (event) => {
    console.log('[LIFECYCLE] Service worker activated');
    event.waitUntil(clients.claim());
});