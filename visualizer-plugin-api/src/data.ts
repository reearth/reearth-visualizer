export declare type Data = {
  readonly clientStorage: ClientStorage;
};

export declare type ClientStorage = {
  readonly getAsync: (key: string) => Promise<unknown>;
  readonly setAsync: (key: string, value: unknown) => Promise<void>;
  readonly deleteAsync: (key: string) => Promise<void>;
  readonly keysAsync: () => Promise<string[]>;
  readonly dropStoreAsync: () => Promise<void>;
};
