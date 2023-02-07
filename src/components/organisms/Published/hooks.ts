import { mapValues } from "lodash-es";
import { useState, useMemo, useEffect } from "react";

import type {
  Layer,
  Widget,
  Block,
  WidgetAlignSystem,
  Alignment,
  ClusterProperty,
} from "@reearth/components/molecules/Visualizer";
import { config } from "@reearth/config";

import {
  PublishedData,
  WidgetZone,
  WidgetSection,
  WidgetArea,
  Layer as RawLayer,
  WidgetAreaPadding,
} from "./types";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const sceneProperty = processProperty(data?.property);
  const pluginProperty = Object.keys(data?.plugins ?? {}).reduce<{ [key: string]: any }>(
    (a, b) => ({ ...a, [b]: processProperty(data?.plugins?.[b]?.property) }),
    {},
  );
  const clusterProperty = useMemo<ClusterProperty[]>(
    () => data?.clusters?.map(a => ({ ...processProperty(a.property), id: a.id })) ?? [],
    [data],
  );

  const rootLayer = useMemo(() => {
    return {
      id: "",
      children: data?.layers?.map(processLayer) ?? [],
    };
  }, [data]);

  const tags = data?.tags; // Currently no need to convert tags

  const widgets = useMemo<
    { floatingWidgets: Widget[]; alignSystem: WidgetAlignSystem | undefined } | undefined
  >(() => {
    if (!data || !data.widgets) return undefined;

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
        (w): Widget => ({
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
        (w): Widget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property),
        }),
      );

    const widgetZone = (zone?: WidgetZone | null) => {
      const left = widgetSection(zone?.left);
      const center = widgetSection(zone?.center);
      const right = widgetSection(zone?.right);
      if (!left && !center && !right) return;
      return {
        left,
        center,
        right,
      };
    };

    const widgetSection = (section?: WidgetSection | null) => {
      const top = widgetArea(section?.top);
      const middle = widgetArea(section?.middle);
      const bottom = widgetArea(section?.bottom);
      if (!top && !middle && !bottom) return;
      return {
        top,
        middle,
        bottom,
      };
    };

    const widgetArea = (area?: WidgetArea | null) => {
      const align = area?.align.toLowerCase() as Alignment | undefined;
      const padding = area?.padding as WidgetAreaPadding | undefined;
      const areaWidgets: Widget[] | undefined = area?.widgetIds
        .map<Widget | undefined>(w => widgets?.find(w2 => w === w2.id))
        .filter((w): w is Widget => !!w);
      if (!areaWidgets || areaWidgets.length < 1) return;
      return {
        align: align ?? "start",
        padding: padding ?? { top: 0, bottom: 0, left: 0, right: 0 },
        widgets: areaWidgets,
        background: area?.background as string | undefined,
        centered: area?.centered,
        gap: area?.gap,
      };
    };

    return {
      floatingWidgets,
      alignSystem: data.widgetAlignSystem
        ? {
            outer: widgetZone(data.widgetAlignSystem.outer),
            inner: widgetZone(data.widgetAlignSystem.inner),
          }
        : undefined,
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

  return {
    alias: actualAlias,
    sceneProperty,
    pluginProperty,
    rootLayer,
    tags,
    clusterProperty,
    widgets,
    ready,
    error,
    engineMeta,
  };
};

function processLayer(l: RawLayer): Layer {
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
