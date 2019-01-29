import Store from './../Store';
export interface AirlyInstallationInfo {
    "id": number,
    "location": {
        "latitude": number,
        "longitude": number
    },
    "address": {
        "country": string,
        "city": string,
        "street": string,
        "number": string,
        "displayAddress1": string,
        "displayAddress2": string
    },
    "elevation": number,
    "airly": boolean,
    "sponsor": {
        "name": string,
        "description": string,
        "logo": string,
        "link": string
    }
}
export interface AirlyMeasurementInfo {
    "fromDateTime": string,
    "tillDateTime": string,
    "values": [
        { "name": "PM1", "value": number },
        { "name": "PM25", "value": number },
        { "name": "PM10", "value": number },
        { "name": "PRESSURE", "value": number },
        { "name": "HUMIDITY", "value": number },
        { "name": "TEMPERATURE", "value": number }
    ],
    "indexes": [
        {
            "name": string,
            "value": 35.53,
            "level": string,
            "description": string,
            "advice": string,
            "color": string
        }
    ],
    "standards": [
        {
            "name": string,
            "pollutant": string,
            "limit": number,
            "percent": number,
        }
    ]
}
export interface AirlyMeasurementsInfo {
    "current": AirlyMeasurementInfo,
    "history": AirlyMeasurementInfo[],
    "forecast": AirlyMeasurementInfo[]
}
export interface InstallationArgument {
    id?: number | string,
    nearest?: {
        latitude: number,
        longitude: number
    }
}
export interface MeasurementArgument {
    id?: number | string,
    nearest?: {
        latitude: number,
        longitude: number
    },
    forPoint?: {
        latitude: number,
        longitude: number
    }
}
const urlCore = 'https://airapi.airly.eu/v2';
function installationArgumentToQuery(endpoint: TemplateStringsArray, data: InstallationArgument) {
    let url;
    if (typeof data.id === 'number' || typeof data.id === 'string') {
        url = `${data.id}`;
    } else if (typeof data.nearest === 'object') {
        url = `nearest?lat=${data.nearest.latitude}&lng=${data.nearest.longitude}`;
    }
    return `${urlCore}/${endpoint[0]}${url}`;
}
function measurementArgumentToQuery(endpoint: TemplateStringsArray, data: MeasurementArgument) {
    let url;
    if (typeof data.id === 'number' || typeof data.id === 'string') {
        url = `installation?installationId=${data.id}`;
    } else if (typeof data.nearest === 'object') {
        url = `nearest?lat=${data.nearest.latitude}&lng=${data.nearest.longitude}`;
    } else if (typeof data.forPoint === 'object') {
        url = `point?lat=${data.forPoint.latitude}&lng=${data.forPoint.longitude}`;
    }
    return `${urlCore}/${endpoint[0]}${url}`;
}
async function getApiKey() {
    const apiKey = await Store.Settings.setting('apiKey');
    if (apiKey === null) {
        throw 'No api key available in localStorage.';
    }
    return apiKey;
}
export class AirlyPull {
    static async installation(data: InstallationArgument): Promise<AirlyInstallationInfo> {
        let requestInit: RequestInit = {};
        requestInit.headers = {
            Accept: 'application/json',
            apiKey: await getApiKey()
        };
        const url = installationArgumentToQuery`installations/${data}`;
        console.log(url)

        const response = await fetch(url, requestInit);
        console.debug(response)
        if (!response.ok) {
            throw "Response failed.";
        }
        const json = await response.json();
        console.debug(json)
        return json;
    }
    static async measurements(data: InstallationArgument): Promise<AirlyMeasurementsInfo> {
        let requestInit: RequestInit = {};
        requestInit.headers = {
            Accept: 'application/json',
            apiKey: await getApiKey()
        };
        const url = measurementArgumentToQuery`measurements/${data}`;

        const response = await fetch(url, requestInit);
        console.debug(response)
        if (!response.ok) {
            throw "Response failed.";
        }
        const json = await response.json();
        console.debug(json);
        return json;
    }
}