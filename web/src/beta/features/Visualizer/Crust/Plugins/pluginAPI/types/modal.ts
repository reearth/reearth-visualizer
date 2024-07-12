export declare type Modal = {
  readonly show: (
    html: string,
    options?: {
      width?: number | string;
      height?: number | string;
      background?: string;
    },
  ) => void;
  readonly postMessage: (message: any) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    background?: string;
  }) => void;
  readonly close: () => void;
};
