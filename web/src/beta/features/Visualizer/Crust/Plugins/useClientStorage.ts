import localforage from "localforage";
import { useRef, useMemo, useCallback } from "react";

export type ClientStorage = {
  getAsync: (extensionInstanceId: string, key: string) => Promise<any>;
  setAsync: (extensionInstanceId: string, key: string, value: any) => Promise<void>;
  deleteAsync: (extensionInstanceId: string, key: string) => Promise<void>;
  keysAsync: (extensionInstanceId: string) => Promise<string[]>;
  dropStore: (extensionInstanceId: string) => Promise<void>;
};

export default () => {
  const clientStores = useRef<Map<string, LocalForage>>(new Map());

  const getStore = useCallback((extensionInstanceId: string) => {
    if (!extensionInstanceId) return false;
    const storeName = extensionInstanceId.startsWith("reearth-plugineditor")
      ? extensionInstanceId
      : `reearth-plugin-${extensionInstanceId}`;
    let store = clientStores.current.get(storeName);
    if (!store) {
      store = localforage.createInstance({
        name: storeName,
      });
      clientStores.current.set(storeName, store);
    }
    return store;
  }, []);

  const clientStorage = useMemo(() => {
    return {
      getAsync: (extensionInstanceId: string, key: string) => {
        return new Promise<any>((resolve, reject) => {
          const store = getStore(extensionInstanceId);
          if (!store) {
            reject();
          } else {
            store
              .getItem(key)
              .then((value: any) => {
                resolve(value);
              })
              .catch((err: any) => {
                console.log(
                  `err get client storage value for ${extensionInstanceId} ${key}: ${err}`,
                );
                reject();
              });
          }
        });
      },
      setAsync: (extensionInstanceId: string, key: string, value: any) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(extensionInstanceId);
          if (!store) {
            reject();
          } else {
            store
              .setItem(key, value)
              .then(() => {
                resolve();
              })
              .catch((err: any) => {
                console.log(
                  `err set client storage value for ${extensionInstanceId} ${key} ${value}: ${err}`,
                );
                reject();
              });
          }
        });
      },
      deleteAsync: (extensionInstanceId: string, key: string) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(extensionInstanceId);
          if (!store) {
            reject();
          } else {
            store
              .removeItem(key)
              .then(() => {
                resolve();
              })
              .catch((err: any) => {
                console.log(
                  `err delete client storage value for ${extensionInstanceId} ${key}: ${err}`,
                );
                reject();
              });
          }
        });
      },
      keysAsync: (extensionInstanceId: string) => {
        return new Promise<string[]>((resolve, reject) => {
          const store = getStore(extensionInstanceId);
          if (!store) {
            reject();
          } else {
            store
              .keys()
              .then((value: string[]) => {
                resolve(value);
              })
              .catch((err: any) => {
                console.log(`err get client storage keys for ${extensionInstanceId}: ${err}`);
                reject();
              });
          }
        });
      },
      // Currently not in use.
      dropStore: (extensionInstanceId: string) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(extensionInstanceId);
          if (!store) {
            reject();
          } else {
            store
              .dropInstance()
              .then(() => resolve())
              .catch((err: any) => {
                console.log(`err drop client storage for ${extensionInstanceId}: ${err}`);
                reject();
              })
              .finally(() => {
                clientStores.current.delete(extensionInstanceId);
              });
          }
        });
      },
    };
  }, [getStore]);

  return clientStorage;
};
