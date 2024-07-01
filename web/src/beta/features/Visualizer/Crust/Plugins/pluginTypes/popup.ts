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
  readonly postMessage: (message: any) => void;
  readonly update: (options: {
    width?: number | string;
    height?: number | string;
    position?: PopupPosition;
    offset?: PopupOffset;
  }) => void;
  readonly close: () => void;
};
