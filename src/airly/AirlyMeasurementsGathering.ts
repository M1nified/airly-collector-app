import { AirlyPull, InstallationArgument, AirlyMeasurementInfo } from './AirlyPull';
import Store from '../Store';
import { db } from "./../IndexedDB";

export async function updateMeasurements(data: InstallationArgument) {
    try {
        const installationInfo = await Store.Airly.installation(data);
        const id = installationInfo.id;
        const measurements = await AirlyPull.measurements(data);
        const currentTime = new Date().toISOString();
        return await Promise.all([
            storeHistory(id, measurements.history),
            storeForecast(id, measurements.forecast, currentTime),
            storeUpdateTime(id, currentTime),
        ]);
    } catch (ex) {
        return false;
    }
}
async function storeHistory(installationId: number, data: AirlyMeasurementInfo[]) {
    const records = data.map(measurement => ({
        installationId,
        measurement
    }))
    return db('History').measurement.putAll(records);
}
async function storeForecast(installationId: number, data: AirlyMeasurementInfo[], currentTime = new Date().toISOString()) {
    const records = data.map(measurement => ({
        installationId,
        predictionDateTime: currentTime,
        measurement
    }));
    return db('History').forecast.putAll(records);
}
async function storeUpdateTime(installationId: number, updateDateTime = new Date().toISOString()) {
    const record = {
        installationId,
        updateDateTime
    }
    return db('History').updates.put(record);
}