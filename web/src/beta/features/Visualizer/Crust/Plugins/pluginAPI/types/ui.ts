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
  readonly postMessage: (message: any) => void;
  readonly resize: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended?: boolean | undefined,
  ) => void;
  readonly close: () => void;
};
