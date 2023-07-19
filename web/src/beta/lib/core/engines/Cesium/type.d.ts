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
}
