export declare type PopupPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export declare type PopupOffset =
  | number
  | {
      mainAxis?: number;
      crossAxis?: number;
      alignmentAxis?: number | null;
    };

export declare type Popup = {
  readonly show: (
    html: string,
    options?: {
      width?: number | string;
      height?: number | string;
      position?: PopupPosition;
      offset?: PopupOffset;
    },
  ) => void;
  readonly postMessage: (message: unknown) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    position?: PopupPosition;
    offset?: PopupOffset;
  }) => void;
  readonly close: () => void;
  readonly on: PopupEvents["on"];
  readonly off: PopupEvents["off"];
};

export declare type PopupEventType = {
  close: [];
};

export declare type PopupEvents = {
  readonly on: <T extends keyof PopupEventType>(
    type: T,
    callback: (...args: PopupEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof PopupEventType>(
    type: T,
    callback: (...args: PopupEventType[T]) => void,
  ) => void;
};
