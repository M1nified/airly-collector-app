const dbInfo: any = {
    InstallationInfo: {
        version: 1,
        onupgradeneeded(db: IDBDatabase) {
            const objectStore = db.createObjectStore(
                "installations",
                { keyPath: "id" }
            )
        },
        methods(getDb: Function): Record<any, Function> {
            return {
                async get(id: number) {
                    const db = await getDb();
                    const transaction = db.transaction(["installations"], "readwrite");
                    const objectStore = transaction.objectStore("installations");
                    return new Promise((resolve, reject) => {
                        const req = objectStore.get(id);
                        req.onsuccess = (event: any) => {
                            console.log('onsuccess', req.result)
                            resolve(req.result);
                        }
                    })
                },
                async put(data: any) {
                    const db = await getDb();
                    const transaction = db.transaction(["installations"], "readwrite");
                    const objectStore = transaction.objectStore("installations");
                    const req = objectStore.add(data);
                    req.oncomplete = (event: any) => {
                        Promise.resolve(true);
                    }
                }
            }
        }
    },
    History: {
        version: 1,
        onupgradeneeded(db: IDBDatabase) {
            if (!db.objectStoreNames.contains('measurementHistory')) {
                const objectStore = db.createObjectStore(
                    "measurementHistory",
                    {
                        keyPath: [
                            "installationId",
                            "measurement.fromDateTime",
                            "measurement.tillDateTime"]
                    }
                )
                objectStore.createIndex("installationId", "installationId", { unique: false });
                objectStore.createIndex("fromDateTime", "measurement.fromDateTime", { unique: false });
                objectStore.createIndex("tillDateTime", "measurement.tillDateTime", { unique: false });
            }
            if (!db.objectStoreNames.contains('forecastHistory')) {
                const objectStore = db.createObjectStore(
                    "forecastHistory",
                    {
                        keyPath: [
                            "installationId",
                            "predictionDateTime",
                            "measurement.fromDateTime",
                            "measurement.tillDateTime"]
                    }
                )
                objectStore.createIndex("installationId", "installationId");
                objectStore.createIndex("fromDateTime", "measurement.fromDateTime", { unique: false });
                objectStore.createIndex("tillDateTime", "measurement.tillDateTime", { unique: false });
                objectStore.createIndex("predictionDateTime", "predictionDateTime", { unique: false });
            }
        },
        methods(getDb: Function): Record<any, any> {
            return {
                measurement: {
                    async get(installationId: number) {
                        console.log('get', installationId)
                        const db = await getDb();
                        const transaction = db.transaction(["measurementHistory"], "readonly");
                        const objectStore = transaction.objectStore("measurementHistory");
                        return new Promise((resolve, reject) => {
                            const fromIndex: IDBIndex = objectStore.index('installationId');
                            const keyRange = IDBKeyRange.only(installationId);
                            const req = fromIndex.getAll(keyRange);
                            req.onsuccess = (event: any) => {
                                console.log(req.result);
                                resolve(req.result);
                            }
                            req.onerror = (event) => {
                                console.error(event);
                                reject(event);
                            }
                        })
                    },
                    async putAll(data: any[]) {
                        console.debug(data)
                        const db = await getDb();
                        const transaction = db.transaction(["measurementHistory"], "readwrite");
                        const objectStore = transaction.objectStore("measurementHistory");
                        const promises = data.map(record => {
                            return new Promise((resolve, reject) => {
                                const req: IDBRequest = objectStore.put(record);
                                req.onsuccess = (event: any) => {
                                    console.debug('measurement.putAll success')
                                    resolve(true);
                                }
                                req.onerror = (event: any) => {
                                    console.error('measurement.putAll error', event, record)
                                    reject();
                                }
                            })
                        })
                        return await Promise.all(promises);
                    }
                },
                forecast: {
                    async get(fromPredictionDateTime: any, tillPredictionDateTime: any) {
                        const db = await getDb();
                        const transaction = db.transaction(["forecastHistory"], "readonly");
                        const objectStore = transaction.objectStore("forecastHistory");
                        return new Promise((resolve, reject) => {
                            const fromIndex: IDBIndex = objectStore.index('predictionDateTime');
                            const keyRange = IDBKeyRange.bound(fromPredictionDateTime, tillPredictionDateTime)
                            const req = fromIndex.getAll(keyRange);
                            req.onsuccess = (event: any) => {
                                console.log(req.result)
                            }
                        })
                    },
                    async putAll(data: any[]) {
                        console.debug(data)
                        const db = await getDb();
                        const transaction = db.transaction(["forecastHistory"], "readwrite");
                        const objectStore: IDBObjectStore = transaction.objectStore("forecastHistory");
                        const promises = data.map(record => {
                            return new Promise((resolve, reject) => {
                                const req: IDBRequest = objectStore.put(record);
                                req.onsuccess = (event: any) => {
                                    console.debug('complete')
                                    resolve(true);
                                }
                                req.onerror = (event: any) => {
                                    console.error(event);
                                    reject({
                                        event,
                                        record
                                    });
                                }
                            })
                        })
                        return Promise.all(promises);
                    }
                }
            }
        }
    }
};
export function db(name: string) {
    if (typeof dbInfo[name] === 'undefined') {
        throw `IndexedDB '${name}' is not supported.`;
    }
    const version = dbInfo[name].version;
    async function getDb(): Promise<IDBDatabase> {
        const persistent = await ensureDataPersistance();
        console.log('PERSISTENT', persistent);
        return await new Promise((resolve, reject) => {
            const request: IDBOpenDBRequest = indexedDB.open(name, version);
            request.onerror = event => {
                reject(`IndexedDB error`);
            }
            request.onsuccess = (event: any) => {
                console.log('success')
                const db = event.target.result;
                resolve(db);
            }
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                dbInfo[name].onupgradeneeded(db);
                const transaction: IDBTransaction = event.target.transaction;
                transaction.oncomplete = (event) => {
                    console.log('upgraded')
                    resolve(db);
                }
                transaction.onerror = (event) => {
                    reject(event);
                }
            }
        })
    }
    return dbInfo[name].methods(getDb);
}
async function ensureDataPersistance() {
    if (navigator.storage && navigator.storage.persist) {
        const persistent = await navigator.storage.persisted();
        console.log('persistent', persistent)
        return persistent || (await navigator.storage.persist());
    }
    return false;
}
