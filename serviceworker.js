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

async function openCache(cacheName) {
    await caches.open(cacheName);
    const cacheNames = await caches.keys();
    return {
        type: "OPEN_SUCCESS",
        cacheNames
    };
};

async function deleteCache(cacheName) {
    const success = await caches.delete(cacheName);
    const cacheNames = await caches.keys();
    return {
        type: "DELETE_RESPONSE",
        success,
        cacheNames
    };
};

async function searchCache(searchTerm) {
    const cache = await caches.open('defaultCache');
    const results = await cache.matchAll(searchTerm);
    return {
        type: "SEARCH_RESULTS",
        results
    };
};

async function messageHandler(message) {
    const type = message.type;
    let response;
    switch (type) {
        case "ADD_CACHE":
            response = await openCache(message.cacheName);
            return response;
        case "DELETE_CACHE":
            response = await deleteCache(message.cacheName);
            return response;
        case "SEARCH_CACHE":
            response = await searchCache(message.searchCache);
            return response;
        default:
            return {
                type: "ERROR",
                message: "[ERROR] Unknown message type provided to SW"
            };
    }
};

self.addEventListener('message', async event => {
    const response = await messageHandler(event.data);
    event.source.postMessage(response);
});

async function handleFetch(event) {
    const request = event.request;
    console.log(`[CACHES] Request URL ${request.url}`)

    const responseFromCache = await caches.match(request);

    if (responseFromCache) {
        console.log('[CACHES] Responding from cache');
        return responseFromCache;
    }

    try {

        const cache = await caches.open('defaultCache');
        await cache.add(request.clone());
        const responseFromNetwork = await cache.match(request);
        console.log('[CACHES] Responding from network');
        return responseFromNetwork;

    } catch (error) {
        
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}

self.addEventListener('fetch', async (event) => {
    if (event.request.url.includes('cached')) {
        event.respondWith(handleFetch(event));
    }
});