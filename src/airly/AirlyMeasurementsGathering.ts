import { AirlyPull, InstallationArgument, AirlyMeasurementInfo } from './AirlyPull';
import Store from '../Store';
import { db } from "./../IndexedDB";

export async function updateMeasurements(data: InstallationArgument) {
    const installationInfo = await Store.Airly.installation(data);
    const id = installationInfo.id;
    const measurements = await AirlyPull.measurements(data);
    console.debug(measurements)
    return await Promise.all([
        storeHistory(id, measurements.history),
        storeForecast(id, measurements.forecast)]);
}
async function storeHistory(installationId: number, data: AirlyMeasurementInfo[]) {
    const records = data.map(measurement => ({
        installationId,
        measurement
    }))
    db('History').measurement.putAll(records);
}
async function storeForecast(installationId: number, data: AirlyMeasurementInfo[]) {
    const currentTime = new Date().toISOString();
    const records = data.map(measurement => ({
        installationId,
        predictionDateTime: currentTime,
        measurement
    }));
    console.debug(records)
    db('History').forecast.putAll(records);

}