import {
  Event as CesiumEvent,
  DiscardEmptyTileImagePolicy,
  WebMercatorTilingScheme,
  type Credit,
  type ImageryLayerFeatureInfo,
  type ImageryProvider,
  type ImageryTypes,
  type Proxy,
  type Request,
  type TileDiscardPolicy,
  type TilingScheme,
} from "@cesium/engine";
import { TileCache, ZxySource } from "protomaps";

import { getTileCoords, makeKey } from "./helpers";

export interface JapanGSIOptimalBVmapImageryProviderBaseOptions {
  tilingScheme?: TilingScheme;
  tileWidth?: number;
  tileHeight?: number;
}

export abstract class JapanGSIOptimalBVmapImageryProviderBase implements ImageryProvider {
  // Deprecated fields
  readonly defaultAlpha = undefined;
  readonly defaultNightAlpha = undefined;
  readonly defaultDayAlpha = undefined;
  readonly defaultBrightness = undefined;
  readonly defaultContrast = undefined;
  readonly defaultHue = undefined;
  readonly defaultSaturation = undefined;
  readonly defaultGamma = undefined;
  readonly defaultMinificationFilter = undefined as any;
  readonly defaultMagnificationFilter = undefined as any;
  readonly ready: boolean = true;
  readonly readyPromise: Promise<boolean> = Promise.resolve(true);

  tileWidth = 256;
  tileHeight = 256;
  maximumLevel: number | undefined = undefined;
  minimumLevel = 0;
  tilingScheme: TilingScheme = new WebMercatorTilingScheme();
  rectangle = this.tilingScheme.rectangle;
  tileDiscardPolicy: TileDiscardPolicy = undefined as any;
  errorEvent: CesiumEvent = new CesiumEvent();
  credit: Credit = undefined as any;
  proxy: Proxy = undefined as any;
  hasAlphaChannel = true;

  constructor(options?: JapanGSIOptimalBVmapImageryProviderBaseOptions) {
    if (options?.tilingScheme != null) {
      this.tilingScheme = options.tilingScheme;
    }
    if (options?.tileWidth != null) {
      this.tileWidth = options.tileWidth;
    }
    if (options?.tileHeight != null) {
      this.tileHeight = options.tileHeight;
    }
  }

  getTileCredits(_x: number, _y: number, _level: number): Credit[] {
    return undefined as any;
  }

  requestImage(
    _x: number,
    _y: number,
    _level: number,
    _request?: Request | undefined,
  ): Promise<ImageryTypes> | undefined {
    return undefined;
  }

  pickFeatures(
    _x: number,
    _y: number,
    _level: number,
    _longitude: number,
    _latitude: number,
  ): Promise<ImageryLayerFeatureInfo[]> | undefined {
    return undefined;
  }

  // For backward compatibility. Remove this when targeting cesium 1.107.
  get _ready(): boolean {
    return this.ready;
  }

  get _readyPromise(): Promise<boolean> {
    return this.readyPromise;
  }
}

export interface JapanGSIOptimalBVmapLabelImageryProviderOptions
  extends JapanGSIOptimalBVmapImageryProviderBaseOptions {
  url: string;
  minimumDataLevel: number;
  maximumDataLevel: number;
}

export class JapanGSIOptimalBVmapLabelImageryProvider extends JapanGSIOptimalBVmapImageryProviderBase {
  minimumDataLevel: number;
  maximumDataLevel: number;

  readonly tileCache: TileCache;
  private readonly image: HTMLCanvasElement;
  private readonly discardedTileCoords = new Set<string>();

  constructor(options: JapanGSIOptimalBVmapLabelImageryProviderOptions) {
    super(options);
    this.tileDiscardPolicy = new DiscardEmptyTileImagePolicy();
    this.minimumDataLevel = options.minimumDataLevel;
    this.maximumDataLevel = options.maximumDataLevel;

    const source = new ZxySource(options.url, false);
    this.tileCache = new TileCache(source, 1024);

    this.image = document.createElement("canvas");
    this.image.width = 1;
    this.image.height = 1;
  }

  requestImage(
    _x: number,
    _y: number,
    _level: number,
    _request?: Request | undefined,
  ): Promise<ImageryTypes> | undefined {
    const key = makeKey({ x: _x, y: _y, level: _level });
    return (async () => {
      if (_level < this.minimumDataLevel || this.discardedTileCoords.has(key)) {
        return DiscardEmptyTileImagePolicy.EMPTY_IMAGE;
      }
      // Populate tile cache in advance.
      await this.tileCache.get(
        getTileCoords({ x: _x, y: _y, level: _level }, this.maximumDataLevel),
      );
      return this.image;
    })().catch(() => {
      this.discardedTileCoords.add(key);
      return DiscardEmptyTileImagePolicy.EMPTY_IMAGE;
    });
  }
}
