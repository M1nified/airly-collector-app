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
                            resolve(req.result);
                        }
                        req.onerror = (event: any) => {
                            console.error(event, id)
                            reject(req.result);
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
        version: 2,
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
            if (!db.objectStoreNames.contains('updates')) {
                const objectStore = db.createObjectStore(
                    "updates",
                    {
                        keyPath: [
                            "installationId",
                            "updateDateTime"]
                    }
                )
                objectStore.createIndex("installationId", "installationId", { unique: false });
                objectStore.createIndex("updateDateTime", "updateDateTime", { unique: false });
            }
        },
        methods(getDb: Function): Record<any, any> {
            return {
                measurement: {
                    async get(installationId: number) {
                        const db = await getDb();
                        const transaction = db.transaction(["measurementHistory"], "readonly");
                        const objectStore = transaction.objectStore("measurementHistory");
                        return new Promise((resolve, reject) => {
                            const fromIndex: IDBIndex = objectStore.index('installationId');
                            const keyRange = IDBKeyRange.only(installationId);
                            const req = fromIndex.getAll(keyRange);
                            req.onsuccess = (event: any) => {
                                resolve(req.result);
                            }
                            req.onerror = (event) => {
                                console.error(event, installationId);
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
                                resolve();
                            }
                            req.onerror = (event: any) => {
                                console.error(event, fromPredictionDateTime, tillPredictionDateTime)
                                reject();
                            }
                        })
                    },
                    async putAll(data: any[]) {
                        const db = await getDb();
                        const transaction = db.transaction(["forecastHistory"], "readwrite");
                        const objectStore: IDBObjectStore = transaction.objectStore("forecastHistory");
                        const promises = data.map(record => {
                            return new Promise((resolve, reject) => {
                                const req: IDBRequest = objectStore.put(record);
                                req.onsuccess = (event: any) => {
                                    resolve(true);
                                }
                                req.onerror = (event: any) => {
                                    console.error(event, data);
                                    reject({
                                        event,
                                        record
                                    });
                                }
                            })
                        })
                        return Promise.all(promises);
                    }
                },
                updates: {
                    async getMostRecent(installationId: number) {
                        const db = await getDb();
                        const transaction = db.transaction(["updates"], "readonly");
                        const objectStore = transaction.objectStore("updates");
                        return new Promise((resolve, reject) => {
                            const fromIndex: IDBIndex = objectStore.index('installationId');
                            const keyRange = IDBKeyRange.only(installationId)
                            const req = fromIndex.getAll(keyRange);
                            req.onsuccess = (event: any) => {
                                const theMostRecent = req.result.reduce((mostRecent, current) => {
                                    if (mostRecent.updateDateTime < current.updateDateTime)
                                        return current;
                                    return mostRecent;
                                }, req.result[0] || {})
                                resolve(theMostRecent);
                            };
                            req.onerror = (event: any) => {
                                console.error(event, installationId);
                                reject(event);
                            }
                        })
                    },
                    async put(data: any) {
                        const db = await getDb();
                        const transaction = db.transaction(["updates"], "readwrite");
                        const objectStore = transaction.objectStore("updates");
                        return await new Promise((resolve, reject) => {
                            const req: IDBRequest = objectStore.put(data);
                            req.onsuccess = (event: any) => {
                                resolve(true);
                            }
                            req.onerror = (event: any) => {
                                console.error('updates.put error', event, data)
                                reject();
                            }
                        });
                    }
                }
            }
        }
    },
    Settings: {
        version: 1,
        onupgradeneeded(db: IDBDatabase) {
            if (!db.objectStoreNames.contains('global')) {
                const objectStore = db.createObjectStore(
                    "global",
                    { keyPath: "name" }
                )
                objectStore.createIndex("name", "name", { unique: true });
                objectStore.createIndex("value", "value", { unique: false });
            }

        },
        methods(getDb: Function): Record<any, any> {
            return {
                global: {
                    async get(name: string) {
                        const db = await getDb();
                        const transaction = db.transaction(["global"], "readonly");
                        const objectStore = transaction.objectStore("global");
                        return new Promise((resolve, reject) => {
                            const fromIndex: IDBIndex = objectStore.index('name');
                            const keyRange = IDBKeyRange.only(name);
                            const req = fromIndex.get(keyRange);
                            req.onsuccess = (event: any) => {
                                resolve(req.result);
                            }
                            req.onerror = (event) => {
                                console.error(event);
                                reject(event);
                            }
                        })
                    },
                    async put(setting: { name: string, value: any }) {
                        const db = await getDb();
                        const transaction = db.transaction(["global"], "readwrite");
                        const objectStore = transaction.objectStore("global");
                        return new Promise((resolve, reject) => {
                            const req: IDBRequest = objectStore.put(setting);
                            req.onsuccess = (event: any) => {
                                resolve(true);
                            }
                            req.onerror = (event: any) => {
                                console.error('measurement.putAll error', event, setting);
                                reject(event);
                            }
                        })
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
        console.debug('PERSISTENT', persistent);
        return await new Promise((resolve, reject) => {
            const request: IDBOpenDBRequest = indexedDB.open(name, version);
            request.onerror = event => {
                reject(`IndexedDB error`);
            }
            request.onsuccess = (event: any) => {
                const db = event.target.result;
                resolve(db);
            }
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                dbInfo[name].onupgradeneeded(db);
                const transaction: IDBTransaction = event.target.transaction;
                transaction.oncomplete = (event) => {
                    console.debug('upgraded')
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
        return persistent || (await navigator.storage.persist());
    }
    return false;
}
