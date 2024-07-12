export declare type Data = {
  readonly clientStorage: ClientStorage;
};

export declare type ClientStorage = {
  readonly getAsync: (extensionInstanceId: string, key: string) => Promise<any>;
  readonly setAsync: (extensionInstanceId: string, key: string, value: any) => Promise<void>;
  readonly deleteAsync: (extensionInstanceId: string, key: string) => Promise<void>;
  readonly keysAsync: (extensionInstanceId: string) => Promise<string[]>;
  readonly dropStoreAsync: (extensionInstanceId: string) => Promise<void>;
};
