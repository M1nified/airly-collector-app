import { autoupdateAll, updateInstallationsAll } from './autoupdate';

const CACHE_NAME = 'airly-collector-cache-v1';
const urlsToCache = [
    '/airly-collector-app/',
    '/airly-collector-app/dist/build.js'
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
    // updateAll();
})

self.addEventListener('sync', (event: any) => {
    console.debug('sync', event);
    if (event.tag == 'autoupdateAllSync') {
        event.waitUntil(updateAll())
    }
})

self.addEventListener('message', function (event: any) {
    if (event.data.type) {
        event.waitUntil(processMessage(event.data));
    }
});

self.addEventListener('online', (event: any) => {
    // event.waitUntil(updateAll())
})

self.addEventListener('push', function (event: any) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: `${event.data.text()}`,
        icon: 'images/icons/icon-128x128.png'
        // badge: 'images/badge.png'
    };

    event.waitUntil((<any>self).registration.showNotification(title, options));
});

async function processMessage(eventData: any) {
    const { type } = eventData;
    switch (type) {
        case 'cast':
            return processCast(eventData);
            break;

        default:
            break;
    }
}

async function processCast(eventData: any) {
    const { action } = eventData;
    switch (action) {
        case 'autoupdateAll':
            await updateInstallationsAll();
            send_message_to_all_clients({
                action,
                data: true
            });
            break;

        default:
            break;
    }
}

let updateAllTimeout: any = null;

async function updateAll() {
    clearTimeout(updateAllTimeout);
    await autoupdateAll();
    // scheduleUpdateAll();
    return;
}

function scheduleUpdateAll() {
    clearTimeout(updateAllTimeout);
    updateAllTimeout = setTimeout(updateAll, 60000 * 60);
}

function send_message_to_client(client, msg) {
    return new Promise(function (resolve, reject) {
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function (event) {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}

function send_message_to_all_clients(msg) {
    (<any>self).clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Message: " + m));
        })
    })
}
