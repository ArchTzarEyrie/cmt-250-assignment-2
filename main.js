let versionNumber = 1;

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
