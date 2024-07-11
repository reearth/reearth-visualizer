import { mapValues } from "lodash-es";
import { useState, useMemo, useEffect, useCallback } from "react";

import type { Block, ClusterProperty } from "@reearth/classic/components/molecules/Visualizer";
import {
  InternalWidget,
  WidgetAlignSystem,
  WidgetAlignment,
  BuiltinWidgets,
  isBuiltinWidget,
} from "@reearth/classic/core/Crust";
import {
  convertLegacyLayer,
  type Layer,
  type LegacyLayer,
  convertLegacyCluster,
} from "@reearth/classic/core/mantle";
import type { ComputedLayer } from "@reearth/classic/core/mantle/types";
import type { LayerSelectionReason } from "@reearth/classic/core/Map/Layers/hooks";
import { config } from "@reearth/services/config";
import { useSelected } from "@reearth/services/state";

import type {
  PublishedData,
  WidgetZone,
  WidgetSection,
  WidgetArea,
  Layer as RawLayer,
  WidgetAreaPadding,
} from "./types";
import { useGA } from "./useGA";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [selected, select] = useSelected();

  const sceneProperty = processProperty(data?.property);
  const pluginProperty = useMemo(
    () =>
      Object.keys(data?.plugins ?? {}).reduce<{ [key: string]: any }>(
        (a, b) => ({ ...a, [b]: processProperty(data?.plugins?.[b]?.property) }),
        {},
      ),
    [data?.plugins],
  );

  const legacyClusters = useMemo<ClusterProperty[]>(
    () => data?.clusters?.map(a => ({ ...processProperty(a.property), id: a.id })) ?? [],
    [data],
  );
  const clusters = convertLegacyCluster(legacyClusters);

  const layers = useMemo(() => {
    return [
      convertLegacyLayer({
        id: "rootlayer",
        children: data?.layers?.map(l => processLayer(l)).filter((l): l is Layer => !!l),
      }),
    ].filter((l): l is Layer => !!l);
  }, [data]);

  const tags = data?.tags; // Currently no need to convert tags

  const widgets = useMemo<
    | {
        floatingWidgets: InternalWidget[];
        alignSystem: WidgetAlignSystem | undefined;
        ownBuiltinWidgets: (keyof BuiltinWidgets)[];
      }
    | undefined
  >(() => {
    if (!data?.widgets) return undefined;

    const widgetsInWas = new Set<string>();
    if (data.widgetAlignSystem) {
      for (const z of ["inner", "outer"] as const) {
        for (const s of ["left", "center", "right"] as const) {
          for (const a of ["top", "middle", "bottom"] as const) {
            for (const w of data.widgetAlignSystem?.[z]?.[s]?.[a]?.widgetIds ?? []) {
              widgetsInWas.add(w);
            }
          }
        }
      }
    }

    const floatingWidgets = data?.widgets
      .filter(w => !widgetsInWas.has(w.id))
      .map(
        (w): InternalWidget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property),
        }),
      );

    const widgets = data?.widgets
      .filter(w => widgetsInWas.has(w.id))
      .map(
        (w): InternalWidget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property),
        }),
      );

    const widgetZone = (zone?: WidgetZone | null) => {
      return {
        left: widgetSection(zone?.left),
        center: widgetSection(zone?.center),
        right: widgetSection(zone?.right),
      };
    };

    const widgetSection = (section?: WidgetSection | null) => {
      return {
        top: widgetArea(section?.top),
        middle: widgetArea(section?.middle),
        bottom: widgetArea(section?.bottom),
      };
    };

    const widgetArea = (area?: WidgetArea | null) => {
      const align = area?.align.toLowerCase() as WidgetAlignment | undefined;
      const padding = area?.padding as WidgetAreaPadding | undefined;
      const areaWidgets: InternalWidget[] | undefined = area?.widgetIds
        .map<InternalWidget | undefined>(w => widgets?.find(w2 => w === w2.id))
        .filter((w): w is InternalWidget => !!w);
      return {
        align: align ?? "start",
        padding: {
          top: padding?.top ?? 6,
          bottom: padding?.bottom ?? 6,
          left: padding?.left ?? 6,
          right: padding?.right ?? 6,
        },
        gap: area?.gap ?? 6,
        widgets: areaWidgets || [],
        background: area?.background as string | undefined,
        centered: area?.centered,
      };
    };

    const ownBuiltinWidgets = data.widgets.reduce<(keyof BuiltinWidgets)[]>((res, next) => {
      const id = `${next.pluginId}/${next.extensionId}`;
      return isBuiltinWidget(id) && widgetsInWas.has(next.id) ? [...res, id] : res;
    }, []);

    return {
      floatingWidgets,
      alignSystem: data.widgetAlignSystem
        ? {
            outer: widgetZone(data.widgetAlignSystem.outer),
            inner: widgetZone(data.widgetAlignSystem.inner),
          }
        : undefined,
      ownBuiltinWidgets,
    };
  }, [data]);

  const actualAlias = useMemo(
    () => alias || new URLSearchParams(window.location.search).get("alias") || undefined,
    [alias],
  );

  useEffect(() => {
    const url = dataUrl(actualAlias);
    (async () => {
      try {
        const res = await fetch(url, {});
        if (res.status >= 300) {
          setError(true);
          return;
        }
        const d = (await res.json()) as PublishedData | undefined;
        if (d?.schemaVersion !== 1) {
          // TODO: not supported version
          return;
        }

        // For compability: map tiles are not shown by default
        if (
          new Date(d.publishedAt) < new Date(2021, 0, 13, 18, 20, 0) &&
          (!d?.property?.tiles || d.property.tiles.length === 0)
        ) {
          d.property = {
            ...d.property,
            tiles: [{ id: "___default_tile___" }],
          };
        }

        setData(d);
      } catch (e) {
        // TODO: display error for users
        console.error(e);
      } finally {
        setReady(true);
      }
    })();
  }, [actualAlias]);

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken: config()?.cesiumIonAccessToken,
    }),
    [],
  );

  const selectedLayerId = useMemo(
    () =>
      selected?.type === "layer"
        ? { layerId: selected.layerId, featureId: selected.featureId }
        : undefined,
    [selected],
  );

  const layerSelectionReason = useMemo(
    () => (selected?.type === "layer" ? selected.layerSelectionReason : undefined),
    [selected],
  );

  const selectLayer = useCallback(
    (
      id?: string,
      featureId?: string,
      _layer?: () => Promise<ComputedLayer | undefined>,
      layerSelectionReason?: LayerSelectionReason,
    ) => select(id ? { layerId: id, featureId, layerSelectionReason, type: "layer" } : undefined),
    [select],
  );

  // GA
  useGA(sceneProperty);

  return {
    alias: actualAlias,
    sceneProperty,
    pluginProperty,
    layers,
    tags,
    clusters,
    widgets,
    ready,
    error,
    engineMeta,
    selectedLayerId,
    layerSelectionReason,
    selectLayer,
  };
};

function processLayer(l: RawLayer): LegacyLayer {
  return {
    id: l.id,
    title: l.name || "",
    pluginId: l.pluginId,
    extensionId: l.extensionId,
    isVisible: l.isVisible ?? true,
    propertyId: l.propertyId,
    property: processProperty(l.property),
    infobox: l.infobox
      ? {
          property: processProperty(l.infobox.property),
          blocks: l.infobox.fields.map<Block>(f => ({
            id: f.id,
            pluginId: f.pluginId,
            extensionId: f.extensionId,
            property: processProperty(f.property),
          })),
        }
      : undefined,
    tags: l.tags, // Currently no need to convert tags
    children: l.children?.map(processLayer),
  };
}

function processProperty(p: any): any {
  if (typeof p !== "object") return p;
  return mapValues(p, g =>
    Array.isArray(g) ? g.map(h => processPropertyGroup(h)) : processPropertyGroup(g),
  );
}

function processPropertyGroup(g: any): any {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    // For compability
    if (Array.isArray(v)) {
      return v.map(vv =>
        typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v
          ? { ...vv, height: vv.altitude }
          : vv,
      );
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        ...v,
        height: v.altitude,
      };
    }
    return v;
  });
}

function dataUrl(alias?: string): string {
  if (alias && window.REEARTH_CONFIG?.api) {
    return `${window.REEARTH_CONFIG.api}/published_data/${alias}`;
  }
  return "data.json";
}
