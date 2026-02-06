import {
  MouseEventProps,
  NaiveLayerSimple,
  useVisualizer
} from "@reearth/core";
import { useEffect, useRef, useCallback, useState } from "react";

import { DEFAULT_PANO_ZOOM, FRUSTUM_LENGTH } from "./constant";
import { GeoJSONPointFeature } from "./types";

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

  const handleTracking = useCallback((next: boolean) => {
    trackingRef.current = next;
    clickedRef.current = false;
    setIsTracking(next);
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
    const camera = engine.getCamera();

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
            fillColor: "#87dd4e4d",
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
          imageSize: 0.5,
          hideIndicator: true,
          near: 10,
          eyeOffset: [0, 0, -10.1],
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANTSURBVHgB7ZndThNBFMfP7PKRIoQiAdvGxOXCG7iQG7F+oMsb6BOoTyA8AfIG+ATWR/AJaCwgBZOWC7jxgsVgl2DUEk0Rmp3jnEUSEoE9szslMfZ31Sb/3f2fnTMzZ84CtGnzfyPAMFuum+5qBK4tpYOWSIcPkVhHENVfvR3VkWKxDgYxEgCZ7mnIFyjQVX/di9WiihJfgd0sZldWPEhIogBOjAPgNApIa17uCRSFa6vv5iABsQPw864jMFhQPx1IhoeiORV3NCyIwd7te+OWDCqQ3DzhWNhZ2VH3hBhojwCZR2EvxEiZKCP1pgymrq8tVzWv42Mwbc5DO520UsjCYBZaZ55QL6jztc4F7BHw8w9ctWoswCWAAU5lPywWOdoOYKLMz3K1zSCAeuMAvvz8Ef5Pp3ogl+7nXg7CDp9VZGk5oj+5v8XRftzbg81dPwziND1dXTCWycKNwUHObaDbDpyB5eXtKB1rDghsPuboNn0f1j/v/GWeaBwdwdqn7VDD4TAQTzg65iQWj6IUZJDefBSkOUmti5BgucCAFwBGrzwbfg24eF+/RWqUsVvAgBeAEJG7ZG1/H7jU9lkFqcMRxSolzuKsvDehjcJYAJ223RJtFNwAvChBrp9fGjG1HkdkLABn8CpwGctmGSr0GCJuALgepRjq7YNRhjHS0KYWhQSIfCbBKiVQiqpghDqqdtorytyG2qxoXzgN5T2Zvzk0DBxsFEWOjlVKbI276VR38B00oKWS6iFiqK83rId0Ju9Byh7gNADY1ejunUmqRF24BFT6vM2VS6zyhb2Mqo5DosO3DjZCgavVOpGpUaCK1IHW4mXKpRGuWGsjU+fglo+C7jO0D/W7Ew8rqr6O1UFgoPX2Ce1SAi05Ay1CzbPnoIl2ANkVOquq1qBhVCoUju+tR6xi7uCw4yUwaxUmXiNlxxrZ2K1FanBJy66AAVQvaORSW4vEsOqgSSPzQc4k6VInOg/k3i/NJ9ngEHEuU16ahwQY+T7gT0wWhICnOtcgwpvsaukZJMTYFxqdIEyZJ4x+YuIEYdI8YexMTBwbO3+PMG2eMBoAkSkvTp81sWnCmjZPGP9KeULt7v1pO7DChrC0QC2VpQL8a1BT2M/nHWjTpk3L+A15aUf5fJUbQAAAAABJRU5ErkJggg=="
        },
        frustum: {
          color: "#00E0E0",
          opacity: 1,
          zoom: DEFAULT_PANO_ZOOM,
          length: FRUSTUM_LENGTH,
          aspectRatio: camera?.aspectRatio
        },
        transition: {
          rotate: [camera?.heading, camera?.pitch, 0]
        }
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
