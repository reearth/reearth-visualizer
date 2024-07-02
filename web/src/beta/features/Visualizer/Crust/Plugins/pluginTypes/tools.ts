export declare type Tools = {
  readonly cartographicToCartesian: (cartographic: {
    readonly longitude: number;
    readonly latitude: number;
    readonly height: number;
  }) => {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly cartesianToCartographic: (cartesian: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  }) => {
    readonly longitude: number;
    readonly latitude: number;
    readonly height: number;
  };
};
