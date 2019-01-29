import { AirlyPull, InstallationArgument, AirlyInstallationInfo, AirlyMeasurementInfo } from './airly/AirlyPull';
import { db } from "./IndexedDB";
import { updateMeasurements } from './airly/AirlyMeasurementsGathering';
interface AirlyStore {
    installationInfos: Record<number, AirlyInstallationInfo>
}
const airlyStore: AirlyStore = { installationInfos: {} }
class Store {
    static Airly = {
        store: airlyStore,
        async installationById(id: number | string): Promise<AirlyInstallationInfo> {
            return await this.installation({ id });
        },
        async installation(data: InstallationArgument): Promise<AirlyInstallationInfo> {
            if (typeof data.id === 'number' || typeof data.id === 'string') {
                const id = parseInt(data.id.toString());
                const info = await db('InstallationInfo').get(id);
                if (typeof info !== 'undefined') {
                    console.info('fast')
                    return info;
                }
            }
            console.info('slow')
            const installationInfo = await AirlyPull.installation(data);
            this.store.installationInfos[installationInfo.id] = installationInfo;
            await db('InstallationInfo').put(installationInfo);
            return installationInfo;
        },
        async measurements(data: InstallationArgument): Promise<{ installationId: number, measurement: AirlyMeasurementInfo }[]> {
            const id = (await this.installation(data)).id;
            const measurements = await db('History').measurement.get(id);
            return measurements;
        },
        async historyUpdateDateTime(data: InstallationArgument): Promise<{ installationId: number, updateDateTime: string }> {
            const id = (await this.installation(data)).id;
            const mostRecentUpdate = await db('History').updates.getMostRecent(id);
            return mostRecentUpdate;
        }
    }
    static Settings = {
        async setting(name: string, value?: any) {
            if (typeof value === 'undefined') {
                const setting = await db('Settings').global.get(name);
                return setting && setting.value;
            } else {
                return await db('Settings').global.put({ name, value });
            }
        }
    }
}

export default Store;
