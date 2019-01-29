import { autoupdateAll } from './autoupdate';

const CACHE_NAME = 'airly-collector-cache-v1';
const urlsToCache = [
    '/',
    '/dist/build.js'
];
self.addEventListener('install', async (event: any) => {
    console.debug(event);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    )
});
self.addEventListener('fetch', (event: any) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response)
                    return response;
                return fetch(event.request)
            })
    )
});

self.addEventListener('activate', async event => {
    console.debug('activate', event);
})

self.addEventListener('sync', (event: any) => {
    console.debug('sync', event);
    if (event.tag == 'autoupdateAllSync') {
        event.waitUntil(updateAll())
    }
})

self.addEventListener('message', function (event: any) {
    console.log("SW Received Message: " + event.data);
});

self.addEventListener('online', (event: any) => {
    event.waitUntil(updateAll())

})

let updateAllTimeout: any = null;

async function updateAll() {
    clearTimeout(updateAllTimeout);
    await autoupdateAll();
    scheduleUpdateAll();
    return;
}

function scheduleUpdateAll() {
    clearTimeout(updateAllTimeout);
    updateAllTimeout = setTimeout(updateAll, 60000 * 60);
}

updateAll();
