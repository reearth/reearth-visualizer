import { ImageryProvider } from "cesium";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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
  const { providers } = useImageryProviders({
    tiles,
    cesiumIonAccessToken,
    presets: tilePresets,
  });

  const memoTiles = useMemo(
    () =>
      tiles
        ?.map(({ id, ...tile }) => ({ ...tile, id, provider: providers[id]?.[2] }))
        .filter(({ provider }) => !!provider) ?? [],
    [tiles, providers],
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

type Providers = {
  [id: string]: [string | undefined, string | undefined, ImageryProvider];
};

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
  providers: Providers;
} {
  const resolvedPresetProviders = useRef<ResolvedProviders>({});
  const [providers, setProviders] = useState<Providers>({});

  const providerKey = useCallback(
    (t: Omit<Tile, "id">) => `${t.tile_type || "default"}_${t.tile_url}_${cesiumIonAccessToken}`,
    [cesiumIonAccessToken],
  );

  useEffect(() => {
    Promise.all(
      tiles.map(async t => {
        if (!Object.keys(resolvedPresetProviders.current).includes(providerKey(t))) {
          const newProvider = await presets[t.tile_type || "default"]({
            url: t.tile_url,
            cesiumIonAccessToken,
          });
          if (newProvider) {
            resolvedPresetProviders.current[providerKey(t)] = newProvider;
          }
        }
      }),
    ).then(() => {
      setProviders(
        Object.fromEntries(
          tiles.map(({ id, ...t }) => [
            id,
            [t.tile_type, t.tile_url, resolvedPresetProviders.current[providerKey(t)]],
          ]),
        ),
      );
    });
  }, [tiles, cesiumIonAccessToken, presets, resolvedPresetProviders, providerKey]);

  return { providers };
}
