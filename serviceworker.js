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

self.addEventListener('install', async (event) => {
    console.log('[LIFECYCLE] Service worker installed');
    event.waitUntil(setUpCaches());
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[LIFECYCLE] Service worker activated');
    event.waitUntil(clients.claim());
});

async function addCache(cacheName) {
    console.log(`[MESSAGE] Opening cache with name ${cacheName}`);
    await caches.open(cacheName);
    const cacheNames = await caches.keys();
    return {
        type: "OPEN_SUCCESS",
        cacheNames
    };
};

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

async function getCacheNames() {
    console.log('[MESSAGE] Getting all cache names');
    const cacheNames = await caches.keys();
    return {
        type: "CACHE_NAMES_RESPONSE",
        cacheNames
    };
};

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

self.addEventListener('message', async event => {
    console.log(`[MESSAGE] SW received message with type ${event.data.type}`);
    const response = await messageHandler(event.data);
    console.log(`[MESSAGE] Responding to main with type ${response.type}`);
    event.source.postMessage(response);
});
