import { ImageryProvider } from "cesium";
import { useMemo, useState, useEffect, useCallback } from "react";
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
  tile_minLevel?: number;
  tile_maxLevel?: number;
};

export type Props = {
  tiles?: Tile[];
  cesiumIonAccessToken?: string;
};

export default function ImageryLayers({ tiles, cesiumIonAccessToken }: Props) {
  const { providers, providerKey } = useImageryProviders({
    tiles,
    cesiumIonAccessToken,
    presets: tilePresets,
  });

  const memoTiles = useMemo(
    () =>
      tiles
        ?.map(({ id, ...tile }) => ({ ...tile, id, provider: providers[providerKey(tile)] }))
        .filter(({ provider }) => !!provider) ?? [],
    [tiles, providerKey, providers],
  );

  return (
    <>
      {memoTiles.map(
        ({ id, tile_opacity: opacity, tile_minLevel: min, tile_maxLevel: max, provider }, i) => (
          <ImageryLayer
            key={`${id}_${i}`}
            imageryProvider={provider}
            minimumTerrainLevel={min}
            maximumTerrainLevel={max}
            alpha={opacity}
            index={i}
          />
        ),
      )}
    </>
  );
}

type ResolvedProviders = {
  [id: string]: ImageryProvider;
};

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
    }) => Promise<ImageryProvider> | ImageryProvider | null;
  };
}): {
  providers: ResolvedProviders;
  providerKey: (tile: Omit<Tile, "id">) => string;
} {
  const [resolvedPresetProviders, setResolvedPresetProviders] = useState<ResolvedProviders>({});

  const providerKey = useCallback(
    (t: Omit<Tile, "id">) =>
      `${cesiumIonAccessToken}_${
        t.tile_type === "url" ? `url_${t.tile_url}` : t.tile_type || "default"
      }`,
    [cesiumIonAccessToken],
  );

  useEffect(() => {
    tiles
      .filter(t => !Object.keys(resolvedPresetProviders).includes(providerKey(t)))
      .forEach(async t => {
        const newProvider = await presets[t.tile_type || "default"]({
          url: t.tile_url,
          cesiumIonAccessToken,
        });
        if (newProvider) {
          setResolvedPresetProviders(prev => ({ ...prev, [providerKey(t)]: newProvider }));
        }
      });
  }, [tiles, cesiumIonAccessToken, presets, resolvedPresetProviders, providerKey]);

  return { providers: resolvedPresetProviders, providerKey };
}
