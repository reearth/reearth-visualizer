import {
  resolveTheme,
  useSystemTheme
} from "@reearth/app/lib/reearth-widget-ui/hooks/useSystemTheme";
import { useVisualizer } from "@reearth/core";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  Dispatch,
  SetStateAction
} from "react";

import { Context } from "../..";
import { Widget } from "../../types";

import {
  DEFAULT_PANO_ZOOM,
  PANORAMA_NAVIGATION_DEBOUNCE_MS,
  STREET_VIEW_HEIGHT
} from "./constant";
import { GeoJSONPointFeature, Property, Location, HeadingPitch } from "./types";
import { usePanoramaHeadingPitchChange } from "./usePanoramaHeadingPitchChange";
import { usePanoramaLocationChange } from "./usePanoramaLocationChange";
import { usePanoramaZoomChange } from "./usePanoramaZoomChange";
import { loadGoogleMaps } from "./useStreetView";

export type Props = {
  layer: {
    feature?: GeoJSONPointFeature;
    layerId?: string;
  };
  setShowPano?: Dispatch<SetStateAction<boolean>>;
  widget: Widget<Property>;
} & Context;

type PanoState = {
  location: Location | null;
  headingPitch: HeadingPitch;
  zoom: number;
  pano: string | null;
};

export default ({ widget, layer, setShowPano }: Props) => {
  const visualizer = useVisualizer();
  const layers = visualizer?.current?.layers;

  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const apiKey = widget.property?.default?.apiKey;

  const [lng, lat] =
    layer.feature?.geometry?.type === "Point"
      ? layer.feature.geometry.coordinates
      : [0, 0];

  const [panoState, setPanoState] = useState<PanoState>(() => ({
    location: { longitude: lng, latitude: lat, height: STREET_VIEW_HEIGHT },
    headingPitch: { heading: 0, pitch: 0 },
    zoom: 1,
    pano: null
  }));

  useEffect(() => {
    if (layer.feature?.geometry.type !== "Point") return;
    setPanoState((s) => ({
      ...s,
      location: { longitude: lng, latitude: lat, height: STREET_VIEW_HEIGHT }
    }));
  }, [lng, lat, layer.feature]);

  const panoDivRef = useRef<HTMLDivElement | null>(null);

  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [panorama, setPanorama] =
    useState<google.maps.StreetViewPanorama | null>(null);

  const lockRef = useRef({
    internal: false,
    navigating: false,
    navTimeout: null as number | null
  });

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
    if (
      !panoDivRef.current ||
      !panoState.location ||
      panoramaRef.current ||
      !apiKey
    )
      return;

    const { latitude, longitude } = panoState.location;
    let cancelled = false;
    let panoChangedListener: google.maps.MapsEventListener | null = null;

    (async () => {
      try {
        await loadGoogleMaps(apiKey);

        if (cancelled || !panoDivRef.current) return;

        const panoInst = new google.maps.StreetViewPanorama(
          panoDivRef.current,
          {
            position: { lat: latitude, lng: longitude },
            pov: panoState.headingPitch,
            zoom: panoState.zoom
          }
        );

        panoramaRef.current = panoInst;
        setPanorama(panoInst);

        panoChangedListener = panoInst.addListener("pano_changed", () => {
          lockRef.current.navigating = true;
          if (lockRef.current.navTimeout) {
            clearTimeout(lockRef.current.navTimeout);
          }
          lockRef.current.navTimeout = window.setTimeout(() => {
            lockRef.current.navigating = false;
          }, PANORAMA_NAVIGATION_DEBOUNCE_MS);
        });
      } catch (err) {
        if (cancelled) return;
        setShowPano?.(false);
        console.error("Failed to load Google Maps Street View:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (panoChangedListener) {
        panoChangedListener.remove();
        panoChangedListener = null;
      }
    };
  }, [
    apiKey,
    panoState.location,
    panoState.headingPitch,
    panoState.zoom,
    setShowPano
  ]);

  useEffect(() => {
    const panoInst = panoramaRef.current;
    const loc = panoState.location;
    if (!panoInst || !loc) return;
    if (lockRef.current.internal || lockRef.current.navigating) return;

    lockRef.current.internal = true;

    const pos = panoInst.getPosition();
    if (!pos || pos.lat() !== loc.latitude || pos.lng() !== loc.longitude) {
      panoInst.setPosition({ lat: loc.latitude, lng: loc.longitude });
    }

    panoInst.setPov(panoState.headingPitch);
    panoInst.setZoom(panoState.zoom);

    lockRef.current.internal = false;
  }, [panoState.location, panoState.headingPitch, panoState.zoom]);

  usePanoramaLocationChange(panorama, (loc) => {
    const panoInst = panoramaRef.current;
    if (!panoInst || !loc) return;
    if (lockRef.current.internal) return;

    lockRef.current.internal = true;

    requestAnimationFrame(() => {
      const pi = panoramaRef.current;
      if (!pi) {
        lockRef.current.internal = false;
        return;
      }

      setPanoState((s) => ({
        ...s,
        pano: pi.getPano() ?? null,
        location: loc,
        headingPitch: pi.getPov(),
        zoom: pi.getZoom() ?? s.zoom
      }));

      lockRef.current.internal = false;
    });
  });

  usePanoramaHeadingPitchChange(panorama, (hp) => {
    if (lockRef.current.internal) return;
    setPanoState((s) => ({ ...s, headingPitch: hp }));
  });

  usePanoramaZoomChange(panorama, (z) => {
    if (lockRef.current.internal) return;
    setPanoState((s) => ({ ...s, zoom: z }));
  });

  useEffect(() => {
    if (!layers || !panoState.location) return;
    if (!layer?.layerId) return;

    const feature = pointFeature(
      panoState.location.longitude,
      panoState.location.latitude
    );

    layers.override(layer.layerId, {
      data: { type: "geojson", value: feature },
      transition: {
        rotate: [
          panoState.headingPitch.heading,
          panoState.headingPitch.pitch,
          0
        ]
      },
      frustum: { zoom: panoState.zoom }
    });
  }, [
    layers,
    layer.layerId,
    pointFeature,
    panoState.location,
    panoState.headingPitch.heading,
    panoState.headingPitch.pitch,
    panoState.zoom
  ]);

  const handleClosePano = useCallback(() => {
    setShowPano?.(false);

    const panoInst = panoramaRef.current;
    if (panoInst) {
      google.maps.event.clearInstanceListeners(panoInst);
      panoramaRef.current = null;
    }
    setPanorama(null);

    lockRef.current.internal = false;
    lockRef.current.navigating = false;
    if (lockRef.current.navTimeout) {
      clearTimeout(lockRef.current.navTimeout);
      lockRef.current.navTimeout = null;
    }

    setPanoState({
      location: null,
      pano: null,
      headingPitch: { heading: 0, pitch: 0 },
      zoom: DEFAULT_PANO_ZOOM
    });
  }, [setShowPano]);

  return {
    themeClass,
    apiKey,
    location: panoState.location,
    panoDivRef,
    headingPitch: panoState.headingPitch,
    zoom: panoState.zoom,
    handleClosePano,
    setZoom: (z: number) => setPanoState((s) => ({ ...s, zoom: z }))
  };
};
