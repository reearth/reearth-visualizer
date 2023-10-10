// ref: https://github.com/takram-design-engineering/plateau-view/blob/6c8225d626cd8085e5d10ffe8980837814c333b0/types.d.ts
declare module "@cesium/engine" {
  export class ShaderSource {
    sources: string[];
    defines: string[];
    constructor(options: { sources: string[]; defines: string[] });
  }

  // Cesium's type definition is wrong. The parameter type of raiseEvent()
  // should be (...args: Parameter<Listener>) instead of
  // (...args: Parameter<Listener>[]).
  // This cannot be fixed by augmentation but by overloading.
  export interface Event<Listener extends (...args: any[]) => void = (...args: any[]) => void> {
    // eslint-disable-next-line @typescript-eslint/method-signature-style
    raiseEvent(...arguments: Parameters<Listener>): void;
  }

  // https://github.com/CesiumGS/cesium/blob/1.105/packages/engine/Source/Core/EllipsoidalOccluder.js
  export class EllipsoidalOccluder {
    constructor(ellipsoid: Ellipsoid, cameraPosition: Cartesian3);

    readonly ellipsoid: Ellipsoid;
    cameraPosition: Cartesian3;
    position: Cartesian3;

    isPointVisible: (occludee: Cartesian3) => boolean;
  }
}

declare module "@cesium/engine/Source/Scene/Cesium3DTilePass" {
  enum Cesium3DTilePass {
    PICK,
  }
  export default Cesium3DTilePass;
}

declare module "@cesium/engine/Source/Scene/Cesium3DTilePassState" {
  export default class Cesium3DTilePassState {
    viewport: BoundingRectangle;
    constructor(arg: { pass: Cesium3DTilePass });
  }
}

declare module "@cesium/engine/Source/Renderer/DrawCommand" {
  const DrawCommand: () => void;
  export default DrawCommand;
}
