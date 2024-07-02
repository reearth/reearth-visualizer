export declare type ClientStorage = {
  getAsync: (extensionInstanceId: string, key: string) => Promise<any>;
  setAsync: (extensionInstanceId: string, key: string, value: any) => Promise<void>;
  deleteAsync: (extensionInstanceId: string, key: string) => Promise<void>;
  keysAsync: (extensionInstanceId: string) => Promise<string[]>;
  dropStore: (extensionInstanceId: string) => Promise<void>;
};
