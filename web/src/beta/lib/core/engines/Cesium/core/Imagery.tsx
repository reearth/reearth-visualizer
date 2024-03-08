import {
  Color,
  ImageryProvider,
  TextureMagnificationFilter,
  TextureMinificationFilter,
} from "cesium";
import { isEqual } from "lodash-es";
import { useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { ImageryLayer } from "resium";

import { tiles as tilePresets } from "./presets";

export type ImageryLayerData = {
  id: string;
  provider: ImageryProvider;
  min?: number;
  max?: number;
  opacity?: number;
};

export type Tile = {
  id: string;
  tile_url?: string;
  tile_type?: string;
  tile_opacity?: number;
  tile_zoomLevel?: number[];
  tile_zoomLevelForURL?: number[];
  heatmap?: boolean;
};

export type Props = {
  tiles?: Tile[];
  cesiumIonAccessToken?: string;
};

export default function ImageryLayers({ tiles, cesiumIonAccessToken }: Props) {
  const { providers, updated } = useImageryProviders({
    tiles,
    cesiumIonAccessToken,
    presets: tilePresets,
  });

  // force rerendering all layers when any provider is updated
  // since Resium does not sort layers according to ImageryLayer component order
  const counter = useRef(0);
  useLayoutEffect(() => {
    if (updated) counter.current++;
  }, [providers, updated]);

  return (
    <>
      {tiles
        ?.map(({ id, ...tile }) => ({ ...tile, id, provider: providers[id]?.[2] }))
        .map(({ id, tile_opacity: opacity, tile_zoomLevel, provider, heatmap }, i) =>
          provider ? (
            <ImageryLayer
              key={`${id}_${i}_${counter.current}`}
              imageryProvider={provider}
              minimumTerrainLevel={tile_zoomLevel?.[0]}
              maximumTerrainLevel={tile_zoomLevel?.[1]}
              alpha={opacity}
              index={i}
              colorToAlpha={heatmap ? Color.WHITE : undefined}
              colorToAlphaThreshold={heatmap ? 1 : undefined}
              magnificationFilter={heatmap ? TextureMagnificationFilter.LINEAR : undefined}
              minificationFilter={heatmap ? TextureMinificationFilter.NEAREST : undefined}
            />
          ) : null,
        )}
    </>
  );
}

type Providers = { [id: string]: [string | undefined, string | undefined, ImageryProvider] };

export function useImageryProviders({
  tiles = [],
  cesiumIonAccessToken,
  presets,
}: {
  tiles?: Tile[];
  cesiumIonAccessToken?: string;
  presets: {
    [key: string]: (opts?: {
      url?: string;
      cesiumIonAccessToken?: string;
      heatmap?: boolean;
      tile_zoomLevel?: number[];
    }) => ImageryProvider | null;
  };
}): { providers: Providers; updated: boolean } {
  const newTile = useCallback(
    (t: Tile, ciat?: string) =>
      presets[t.tile_type || "default"]({
        url: t.tile_url,
        cesiumIonAccessToken: ciat,
        heatmap: t.heatmap,
        tile_zoomLevel: t.tile_zoomLevelForURL,
      }),
    [presets],
  );

  const prevCesiumIonAccessToken = useRef(cesiumIonAccessToken);
  const tileKeys = tiles.map(t => t.id).join(",");
  const prevTileKeys = useRef(tileKeys);
  const prevProviders = useRef<Providers>({});

  // Manage TileProviders so that TileProvider does not need to be recreated each time tiles are updated.
  const { providers, updated } = useMemo(() => {
    const isCesiumAccessTokenUpdated = prevCesiumIonAccessToken.current !== cesiumIonAccessToken;
    const prevProvidersKeys = Object.keys(prevProviders.current);
    const added = tiles.map(t => t.id).filter(t => t && !prevProvidersKeys.includes(t));

    const rawProviders = [
      ...Object.entries(prevProviders.current),
      ...added.map(a => [a, undefined] as const),
    ].map(([k, v]) => ({
      key: k,
      added: added.includes(k),
      prevType: v?.[0],
      prevUrl: v?.[1],
      prevProvider: v?.[2],
      tile: tiles.find(t => t.id === k),
    }));

    const providers = Object.fromEntries(
      rawProviders
        .map(
          ({
            key,
            added,
            prevType,
            prevUrl,
            prevProvider,
            tile,
          }):
            | [string, [string | undefined, string | undefined, ImageryProvider | null | undefined]]
            | null =>
            !tile
              ? null
              : [
                  key,
                  added ||
                  prevType !== tile.tile_type ||
                  prevUrl !== tile.tile_url ||
                  (isCesiumAccessTokenUpdated && (!tile.tile_type || tile.tile_type === "default"))
                    ? [tile.tile_type, tile.tile_url, newTile(tile, cesiumIonAccessToken)]
                    : [prevType, prevUrl, prevProvider],
                ],
        )
        .filter(
          (e): e is [string, [string | undefined, string | undefined, ImageryProvider]] =>
            !!e?.[1][2],
        ),
    );

    const updated =
      !!added.length ||
      !!isCesiumAccessTokenUpdated ||
      !isEqual(prevTileKeys.current, tileKeys) ||
      rawProviders.some(
        p => p.tile && (p.prevType !== p.tile.tile_type || p.prevUrl !== p.tile.tile_url),
      );

    prevTileKeys.current = tileKeys;
    prevCesiumIonAccessToken.current = cesiumIonAccessToken;

    return { providers, updated };
  }, [cesiumIonAccessToken, tiles, tileKeys, newTile]);

  prevProviders.current = providers;
  return { providers, updated };
}
