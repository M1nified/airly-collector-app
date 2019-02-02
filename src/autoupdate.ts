import { updateMeasurements } from './airly/AirlyMeasurementsGathering';
import Store from './Store';

export async function autoupdateAllEnabled() {
    return await Store.Settings.setting('autoupdateAll');
}

export async function autoupdateAll() {
    if (await autoupdateAllEnabled()) {
        return await updateInstallationsAll();
    }
    return false;
}

export async function updateInstallations(installations: { id: number }[]) {
    return await Promise.all(installations.map(({ id }) => {
        return updateMeasurements({ id });
    }))
}

export async function updateInstallationsAll() {
    const installations = await Store.Settings.setting('installations') || [];
    return await updateInstallations(installations);
}
export const App = {
    castAutoupdateAll() {
        const ctrl = navigator.serviceWorker.controller;
        if (ctrl) {
            ctrl.postMessage({
                type: 'cast',
                action: 'autoupdateAll'
            });
        }
    },
    subscribeFor(action: string, callback: Function) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.action && event.data.action === action) {
                callback(event.data);
            }
        })
    }
}
