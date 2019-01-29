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
