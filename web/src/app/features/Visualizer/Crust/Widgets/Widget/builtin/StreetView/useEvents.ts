import {
  MouseEventProps,
  NaiveLayerSimple,
  useVisualizer
} from "@reearth/core";
import { useEffect, useRef, useCallback, useState } from "react";

import { DEFAULT_PANO_ZOOM, FRUSTUM_LENGTH } from "./constant";
import { GeoJSONPointFeature } from "./types";
import { createPegmanPin } from "./utils";

export function useEvent() {
  const visualizer = useVisualizer();
  const engine = visualizer?.current?.engine;
  const layers = visualizer?.current?.layers;

  const [showPano, setShowPano] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const listenersRegisteredRef = useRef(false);
  const trackingRef = useRef(false);
  const clickedRef = useRef(false);

  const trackingLayerIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lng: number; lat: number } | null>(null);

  const [layer, setLayer] = useState<{
    feature?: GeoJSONPointFeature;
    layerId?: string;
  }>({});

  const handleTracking = useCallback((value: boolean) => {
    trackingRef.current = value;
    clickedRef.current = false;
    setIsTracking(value);
    setShowPano(true);
  }, []);

  const pointFeature = useCallback((lng: number, lat: number) => {
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [lng, lat] as [number, number]
      },
      properties: {}
    };
  }, []);

  useEffect(() => {
    if (!engine || !layers) return;

    listenersRegisteredRef.current = true;
    const upsertTrackingPoint = (lng: number, lat: number) => {
      if (!listenersRegisteredRef.current) return;

      lastPosRef.current = { lng, lat };
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!listenersRegisteredRef.current) return;

        const pos = lastPosRef.current;
        if (!pos) return;

        const layerStyle = {
          data: {
            type: "geojson",
            value: pointFeature(pos.lng, pos.lat)
          },
          ellipse: {
            radius: 200,
            fill: true,
            fillColor: "#3B3CD033",
            classificationType: "both"
          }
        } satisfies Pick<NaiveLayerSimple, "data" | "ellipse">;

        if (!trackingLayerIdRef.current) {
          trackingLayerIdRef.current =
            layers.add({ type: "simple", ...layerStyle })?.id ?? null;
        } else {
          layers.override(trackingLayerIdRef.current, layerStyle);
        }
      });
    };

    engine.onMouseMove((e: MouseEventProps) => {
      if (!listenersRegisteredRef.current) return;
      if (!trackingRef.current) return;
      if (e.lat == null || e.lng == null) return;

      upsertTrackingPoint(e.lng, e.lat);
    });

    engine.onClick((e: MouseEventProps) => {
      if (!listenersRegisteredRef.current) return;
      if (!trackingRef.current || clickedRef.current) return;
      if (e.lat == null || e.lng == null) return;

      clickedRef.current = true;
      trackingRef.current = false;
      setIsTracking(false);

      if (trackingLayerIdRef.current) {
        layers.deleteLayer(trackingLayerIdRef.current);
        trackingLayerIdRef.current = null;
      }

      const feature = pointFeature(e.lng, e.lat);

      const layer = layers.add({
        type: "simple",
        data: { type: "geojson", value: feature },
        marker: {
          style: "image",
          heightReference: "relative",
          pixelOffset: [2, -10],
          imageSize: 0.5,
          hideIndicator: true,
          near: 10,
          eyeOffset: [0, 0, -10.1],
          image: createPegmanPin()
        },
        frustum: {
          color: "#3B3CD0",
          opacity: 0.8,
          zoom: DEFAULT_PANO_ZOOM,
          length: FRUSTUM_LENGTH
        },
        transition: {}
      });

      setLayer({ layerId: layer?.id, feature });
      setShowPano(true);
    });

    return () => {
      listenersRegisteredRef.current = false;
      trackingRef.current = false;
      setIsTracking(false);
      clickedRef.current = false;

      if (trackingLayerIdRef.current) {
        layers.deleteLayer(trackingLayerIdRef.current);
        trackingLayerIdRef.current = null;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [engine, layers, pointFeature]);

  const handleClearLayer = useCallback(() => {
    clickedRef.current = false;
    trackingRef.current = false;
    setIsTracking(false);

    if (layer.layerId) {
      layers?.deleteLayer(layer.layerId);
      setLayer({});
    }
  }, [layer.layerId, layers]);

  return {
    layer,
    showPano,
    setShowPano,
    isTracking,
    handleTracking,
    handleClearLayer
  };
}
