export declare type SpatialId = {
  pickSpace: (options?: SpatialIdPickSpaceOptions) => void;
  exitPickSpace: () => void;
  on: SpatialIdEvents["on"];
  off: SpatialIdEvents["off"];
};

export declare type SpatialIdPickSpaceOptions = {
  zoom?: number;
  maxHeight?: number;
  minHeight?: number;
  dataOnly?: boolean;
  rightClickToExit?: boolean;
  color?: string;
  outlineColor?: string;
  groundIndicatorColor?: string;
  selectorColor?: string;
  selectorOutlineColor?: string;
  verticalSpaceIndicatorColor?: string;
  verticalSpaceIndicatorOutlineColor?: string;
};

export declare type SpatialIdSpacePickProps = SpatialIdSpaceData;

export declare type SpatialIdSpaceData = {
  id: string;
  center: { lat: number; lng: number; alt?: number };
  alt: number;
  zoom: number;
  zfxy: {
    z: number;
    f: number;
    x: number;
    y: number;
  };
  zfxyStr: string;
  tilehash: string;
  hilbertTilehash: string;
  hilbertIndex: string;
  vertices: [number, number, number][];
};

export declare type SpatialIdEventType = {
  spacePick: [props: SpatialIdSpacePickProps];
};

export declare type SpatialIdEvents = {
  readonly on: <T extends keyof SpatialIdEventType>(
    type: T,
    callback: (...args: SpatialIdEventType[T]) => void,
    options?: { once?: boolean }
  ) => void;
  readonly off: <T extends keyof SpatialIdEventType>(
    type: T,
    callback: (...args: SpatialIdEventType[T]) => void
  ) => void;
};
