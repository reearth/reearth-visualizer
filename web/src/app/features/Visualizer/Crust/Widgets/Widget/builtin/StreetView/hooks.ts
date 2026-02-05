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

export default ({ widget, layer, setShowPano }: Props) => {
  const visualizer = useVisualizer();
  const engine = visualizer?.current?.engine;
  const layers = visualizer?.current?.layers;

  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const [lng, lat] =
    layer.feature?.geometry?.type === "Point"
      ? layer.feature.geometry.coordinates
      : [0, 0];

  const [location, setLocation] = useState<Location | null>({
    longitude: lng,
    latitude: lat,
    height: 2.5
  });

  useEffect(() => {
    if (layer.feature?.geometry.type === "Point") {
      setLocation({
        longitude: lng,
        latitude: lat,
        height: 2.5
      });
    }
  }, [lng, lat, layer.feature]);

  const [collapsed, setCollapsed] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pano, setPano] = useState<string | null>(null);
  const [headingPitch, setHeadingPitch] = useState<HeadingPitch>({
    heading: 0,
    pitch: 0
  });

  const apiKey = widget.property?.default?.apiKey;

  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const panoSetRef = useRef(false);

  const panoIdRef = useRef<string | null>(null);
  panoIdRef.current = pano;

  const headingPitchRef = useRef(headingPitch);
  const zoomRef = useRef(zoom);
  headingPitchRef.current = headingPitch;
  zoomRef.current = zoom;

  const locationChangedRef = useRef(false);

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
    if (!panoDivRef.current || !location) return;

    let cancelled = false;

    (async () => {
      await loadGoogleMaps(apiKey);
      if (cancelled) return;

      if (!panoramaRef.current) {
        panoramaRef.current = new google.maps.StreetViewPanorama(
          panoDivRef.current as HTMLElement,
          {
            position: {
              lat: location.latitude,
              lng: location.longitude
            }
          }
        );
      }

      const panorama = panoramaRef.current;

      if (!panorama) return;

      if (panoIdRef.current == null) {
        panorama.setPosition({
          lat: location.latitude,
          lng: location.longitude
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (cancelled) return;
        panorama.setPano(panoIdRef.current);
      }

      if (headingPitchRef.current) {
        panorama.setPov(headingPitchRef.current);
      }

      if (zoomRef.current != null) {
        panorama.setZoom(zoomRef.current);
      }
      const feature = pointFeature(location.longitude, location.latitude);
      layers?.override(layer?.layerId || "", {
        data: { type: "geojson", value: feature },
        marker: {
          style: "image",
          heightReference: "clamp",
          image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAANTSURBVHgB7ZndThNBFMfP7PKRIoQiAdvGxOXCG7iQG7F+oMsb6BOoTyA8AfIG+ATWR/AJaCwgBZOWC7jxgsVgl2DUEk0Rmp3jnEUSEoE9szslMfZ31Sb/3f2fnTMzZ84CtGnzfyPAMFuum+5qBK4tpYOWSIcPkVhHENVfvR3VkWKxDgYxEgCZ7mnIFyjQVX/di9WiihJfgd0sZldWPEhIogBOjAPgNApIa17uCRSFa6vv5iABsQPw864jMFhQPx1IhoeiORV3NCyIwd7te+OWDCqQ3DzhWNhZ2VH3hBhojwCZR2EvxEiZKCP1pgymrq8tVzWv42Mwbc5DO520UsjCYBZaZ55QL6jztc4F7BHw8w9ctWoswCWAAU5lPywWOdoOYKLMz3K1zSCAeuMAvvz8Ef5Pp3ogl+7nXg7CDp9VZGk5oj+5v8XRftzbg81dPwziND1dXTCWycKNwUHObaDbDpyB5eXtKB1rDghsPuboNn0f1j/v/GWeaBwdwdqn7VDD4TAQTzg65iQWj6IUZJDefBSkOUmti5BgucCAFwBGrzwbfg24eF+/RWqUsVvAgBeAEJG7ZG1/H7jU9lkFqcMRxSolzuKsvDehjcJYAJ223RJtFNwAvChBrp9fGjG1HkdkLABn8CpwGctmGSr0GCJuALgepRjq7YNRhjHS0KYWhQSIfCbBKiVQiqpghDqqdtorytyG2qxoXzgN5T2Zvzk0DBxsFEWOjlVKbI276VR38B00oKWS6iFiqK83rId0Ju9Byh7gNADY1ejunUmqRF24BFT6vM2VS6zyhb2Mqo5DosO3DjZCgavVOpGpUaCK1IHW4mXKpRGuWGsjU+fglo+C7jO0D/W7Ew8rqr6O1UFgoPX2Ce1SAi05Ay1CzbPnoIl2ANkVOquq1qBhVCoUju+tR6xi7uCw4yUwaxUmXiNlxxrZ2K1FanBJy66AAVQvaORSW4vEsOqgSSPzQc4k6VInOg/k3i/NJ9ngEHEuU16ahwQY+T7gT0wWhICnOtcgwpvsaukZJMTYFxqdIEyZJ4x+YuIEYdI8YexMTBwbO3+PMG2eMBoAkSkvTp81sWnCmjZPGP9KeULt7v1pO7DChrC0QC2VpQL8a1BT2M/nHWjTpk3L+A15aUf5fJUbQAAAAABJRU5ErkJggg=="
        },
        frustum: {
          color: "#00E0E0",
          opacity: 0.9,
          zoom: 1,
          length: 200,
          aspectRatio: 1.5
        }
      });
      panoSetRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    engine,
    headingPitch.heading,
    headingPitch.pitch,
    layer?.layerId,
    layers,
    location,
    pano,
    pointFeature
  ]);

  usePanoramaLocationChange(panoramaRef.current, (loc) => {
    if (!panoSetRef.current || !loc) return;

    const panoId = panoramaRef.current?.getPano() ?? null;

    if (!locationChangedRef.current) {
      locationChangedRef.current = true;
      setPano(panoId);
      setLocation(loc);
      setHeadingPitch(panoramaRef.current!.getPov());
      setZoom(panoramaRef.current!.getZoom() ?? zoom);
    } else {
      setPano(panoId);
      setLocation(loc);
    }
  });

  usePanoramaHeadingPitchChange(panoramaRef.current, (hp) => {
    if (!panoSetRef.current) return;
    setHeadingPitch(hp);
  });

  usePanoramaZoomChange(panoramaRef.current, (z) => {
    if (!panoSetRef.current) return;
    setZoom(z);
  });

  const handleClosePano = useCallback(() => {
    setCollapsed(true);
    setLocation(null);
    setShowPano?.(false);

    if (panoramaRef.current) {
      google.maps.event.clearInstanceListeners(panoramaRef.current);
      panoramaRef.current = null;
    }

    panoSetRef.current = false;
    locationChangedRef.current = false;
  }, [setShowPano]);

  return {
    themeClass,
    apiKey,
    location,
    panoDivRef,
    collapsed,
    headingPitch,
    zoom,
    handleClosePano,
    setCollapsed,
    setZoom
  };
};
