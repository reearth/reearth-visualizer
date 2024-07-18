export declare type UI = {
  readonly show: (
    html: string,
    options?: {
      visible?: boolean;
      width?: number | string;
      height?: number | string;
      extended?: boolean;
    },
  ) => void;
  readonly postMessage: (message: unknown) => void;
  readonly resize: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended?: boolean | undefined,
  ) => void;
  readonly close: () => void;
  readonly on: UIEvents["on"];
  readonly off: UIEvents["off"];
};

export declare type UIEventType = {
  update: [];
  close: [];
};

export declare type UIEvents = {
  readonly on: <T extends keyof UIEventType>(
    type: T,
    callback: (...args: UIEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof UIEventType>(
    type: T,
    callback: (...args: UIEventType[T]) => void,
  ) => void;
};
