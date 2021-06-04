import { useState, useMemo, useEffect, useCallback } from "react";
import ReactGA from "react-ga";
import { EarthLayer, EarthWidget } from "@reearth/components/molecules/EarthEditor/Earth";
import { Block } from "@reearth/components/molecules/EarthEditor/InfoBox/InfoBox";
import { PublishedData } from "./types";

export type Layer = EarthLayer & {
  name?: string;
  infobox?: {
    property?: any;
    blocks?: Block[];
  };
};

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedLayerId, changeSelectedLayerId] = useState<string>();
  const [infoBoxVisible, setInfoBoxVisible] = useState(true);

  const selectLayer = useCallback((id?: string) => {
    changeSelectedLayerId(id);
  }, []);

  const googleAnalyticsData: { enableGA?: boolean; trackingId?: string } = useMemo(
    () => ({
      enableGA: data?.property.googleAnalytics?.enableGA,
      trackingId: data?.property.googleAnalitcs?.trackingId,
    }),
    [data?.property.googleAnalitcs?.trackingId, data?.property.googleAnalytics?.enableGA],
  );

  useEffect(() => {
    if (!googleAnalyticsData.enableGA || !googleAnalyticsData.trackingId) return;
    ReactGA.initialize(googleAnalyticsData.trackingId);
    ReactGA.pageview(window.location.pathname);
  }, [googleAnalyticsData]);

  const layers = useMemo<Layer[] | undefined>(
    () =>
      data?.layers.map(l => ({
        id: l.id,
        title: l.name || "",
        pluginId: l.pluginId,
        extensionId: l.extensionId,
        isVisible: true,
        property: l.property,
        infobox: l.infobox
          ? {
              property: l.infobox.property,
              blocks: l.infobox.fields.map(f => ({
                id: f.id,
                pluginId: f.pluginId,
                extensionId: f.extensionId,
                property: f.property,
              })),
            }
          : undefined,
      })),
    [data],
  );

  const widgets = useMemo<EarthWidget[] | undefined>(
    () =>
      data?.widgets.map(w => ({
        id: `${data.id}/${w.pluginId}/${w.extensionId}`,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: w.property,
        enabled: true,
      })),
    [data],
  );

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers?.find(l => l.id === selectedLayerId) : undefined),
    [layers, selectedLayerId],
  );

  useEffect(() => {
    setInfoBoxVisible(!!selectedLayerId);
  }, [selectedLayerId]);

  useEffect(() => {
    const url = "/data.json";
    (async () => {
      try {
        const d = (await fetch(url, {}).then(r => r.json())) as PublishedData | undefined;
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
        setInitialLoaded(true);
      }
    })();
  }, [alias]);

  return {
    sceneProperty: data?.property,
    selectedLayerId,
    selectLayer,
    layers,
    widgets,
    selectedLayer,
    infoBoxVisible,
    initialLoaded,
  };
};
