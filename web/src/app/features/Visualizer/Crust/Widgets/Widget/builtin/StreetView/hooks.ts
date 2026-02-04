import {
  resolveTheme,
  useSystemTheme
} from "@reearth/app/lib/reearth-widget-ui/hooks/useSystemTheme";
import {
  MouseEventProps,
  NaiveLayerSimple,
  useVisualizer
} from "@reearth/core";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { Context } from "../..";
import { Widget } from "../../types";

import { Property } from "./types";
import { loadGoogleMaps } from "./useStreetView";

export type Props = { widget: Widget<Property> } & Context;

export default ({ widget }: Props) => {
  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const visualizer = useVisualizer();
  const engine = visualizer?.current?.engine;
  const layers = visualizer?.current?.layers;

  // UI states only
  const [collapsed, setCollapsed] = useState(true);
  const [showPano, setShowPano] = useState(false);
  const [streetViewPos, setStreetViewPos] =
    useState<google.maps.LatLngLiteral | null>(null);

  // refs for interaction state
  const trackingRef = useRef(false);
  const clickedRef = useRef(false);
  const listenersRegisteredRef = useRef(false);

  const trackingLayerIdRef = useRef<string | null>(null);
  const finalizedLayerIdRef = useRef<string | null>(null);

  const handleTracking = useCallback((next: boolean) => {
    trackingRef.current = next;
    if (next) {
      clickedRef.current = false;
      setShowPano(false);
    }
  }, []);

  useEffect(() => {
    if (!engine || !layers) return;
    if (listenersRegisteredRef.current) return;
    listenersRegisteredRef.current = true;

    const upsertTrackingPoint = (lng: number, lat: number) => {
      const feature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: {}
      };

      const layerStyle = {
        data: { type: "geojson", value: feature },
        ellipse: {
          radius: 2000,
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
    };

    engine.onMouseMove((e: MouseEventProps) => {
      if (!trackingRef.current) return;
      if (e.lat == null || e.lng == null) return;
      upsertTrackingPoint(e.lng, e.lat);
    });

    engine.onClick((e: MouseEventProps) => {
      if (!trackingRef.current || clickedRef.current) return;
      if (e.lat == null || e.lng == null) return;

      clickedRef.current = true;
      trackingRef.current = false; 

      if (trackingLayerIdRef.current) {
        layers.deleteLayer(trackingLayerIdRef.current);
        trackingLayerIdRef.current = null;
      }

      const feature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lng, e.lat] },
        properties: {}
      };

      const finalLayer = layers.add({
        type: "simple",
        data: { type: "geojson", value: feature },
        marker: {
          style: "image",
          heightReference: "clamp",
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANTSURBVHgB7ZndThNBFMfP7PKRIoQiAdvGxOXCG7iQG7F+oMsb6BOoTyA8AfIG+ATWR/AJaCwgBZOWC7jxgsVgl2DUEk0Rmp3jnEUSEoE9szslMfZ31Sb/3f2fnTMzZ84CtGnzfyPAMFuum+5qBK4tpYOWSIcPkVhHENVfvR3VkWKxDgYxEgCZ7mnIFyjQVX/di9WiihJfgd0sZldWPEhIogBOjAPgNApIa17uCRSFa6vv5iABsQPw864jMFhQPx1IhoeiORV3NCyIwd7te+OWDCqQ3DzhWNhZ2VH3hBhojwCZR2EvxEiZKCP1pgymrq8tVzWv42Mwbc5DO520UsjCYBZaZ55QL6jztc4F7BHw8w9ctWoswCWAAU5lPywWOdoOYKLMz3K1zSCAeuMAvvz8Ef5Pp3ogl+7nXg7CDp9VZGk5oj+5v8XRftzbg81dPwziND1dXTCWycKNwUHObaDbDpyB5eXtKB1rDghsPuboNn0f1j/v/GWeaBwdwdqn7VDD4TAQTzg65iQWj6IUZJDefBSkOUmti5BgucCAFwBGrzwbfg24eF+/RWqUsVvAgBeAEJG7ZG1/H7jU9lkFqcMRxSolzuKsvDehjcJYAJ223RJtFNwAvChBrp9fGjG1HkdkLABn8CpwGctmGSr0GCJuALgepRjq7YNRhjHS0KYWhQSIfCbBKiVQiqpghDqqdtorytyG2qxoXzgN5T2Zvzk0DBxsFEWOjlVKbI276VR38B00oKWS6iFiqK83rId0Ju9Byh7gNADY1ejunUmqRF24BFT6vM2VS6zyhb2Mqo5DosO3DjZCgavVOpGpUaCK1IHW4mXKpRGuWGsjU+fglo+C7jO0D/W7Ew8rqr6O1UFgoPX2Ce1SAi05Ay1CzbPnoIl2ANkVOquq1qBhVCoUju+tR6xi7uCw4yUwaxUmXiNlxxrZ2K1FanBJy66AAVQvaORSW4vEsOqgSSPzQc4k6VInOg/k3i/NJ9ngEHEuU16ahwQY+T7gT0wWhICnOtcgwpvsaukZJMTYFxqdIEyZJ4x+YuIEYdI8YexMTBwbO3+PMG2eMBoAkSkvTp81sWnCmjZPGP9KeULt7v1pO7DChrC0QC2VpQL8a1BT2M/nHWjTpk3L+A15aUf5fJUbQAAAAABJRU5ErkJggg=="
        }
      });

      layers.add({
        type: "simple",
        data: { type: "geojson", value: feature },
        frustum: {
          color: "#00E0E0",
          opacity: 0.9,
          zoom: 1,
          length: 200,
          aspectRatio: 1.5
        }
      });

      finalizedLayerIdRef.current = finalLayer?.id ?? null;

      engine.flyTo({ lat: e.lat, lng: e.lng }, { duration: 2 });

      setStreetViewPos({ lat: e.lat, lng: e.lng });
      setShowPano(true);
      setCollapsed(false);
    });
  }, [engine, layers]);

  const apiKey = widget.property?.default?.apiKey;
  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (!showPano || !panoDivRef.current || !streetViewPos) return;

    (async () => {
      await loadGoogleMaps(apiKey);
      panoRef.current = new google.maps.StreetViewPanorama(
        panoDivRef.current as HTMLElement,
        {
          position: streetViewPos,
          pov: { heading: 0, pitch: 0 },
          zoom: 1
        }
      );
    })();
  }, [showPano, streetViewPos, apiKey]);

  const handleClosePano = useCallback(() => {
    setCollapsed(true);
    setShowPano(false);
    setStreetViewPos(null);

    clickedRef.current = false;
    trackingRef.current = false;

    if (finalizedLayerIdRef.current) {
      layers?.deleteLayer(finalizedLayerIdRef.current);
      finalizedLayerIdRef.current = null;
    }

    panoRef.current = null;
  }, [layers]);

  return {
    themeClass,
    handleTracking,
    showPano,
    panoDivRef,
    collapsed,
    handleClosePano
  };
};
