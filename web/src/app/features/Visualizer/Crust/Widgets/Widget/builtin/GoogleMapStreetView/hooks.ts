import {
  resolveTheme,
  useSystemTheme
} from "@reearth/app/lib/reearth-widget-ui/hooks/useSystemTheme";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Context } from "../..";
import { extractLines } from "../../../../utils";
import { Widget } from "../../types";

import { loadGoogleMaps } from "./useStreetViewPlayer";

import { Property } from ".";

type LngLat = [number, number];

export type Props = {
  widget: Widget<Property>;
} & Context;

function dividesRoute(route: any) {
  const result: { lat: number; lng: number }[] = [];

  if (turf.getType(route) !== "LineString") {
    console.error("Route is not LineString");
    return result;
  }

  const lineChunk = turf.lineChunk(route, 0.05, { units: "kilometers" });

  turf.coordEach(lineChunk, (currentCoord) => {
    const tempCoord = { lat: currentCoord[1], lng: currentCoord[0] };
    const last = result[result.length - 1];

    if (!last || last.lat !== tempCoord.lat || last.lng !== tempCoord.lng) {
      result.push(tempCoord);
    }
  });

  return result;
}

export default function useHooks({
  widget,
  onSketchSetType,
  onLayerAdd,
  onFlyTo,
  onLayerOverride,
}: Props) {
  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const apiKey = useMemo(
    () => widget.property?.default?.apiKey,
    [widget.property?.default?.apiKey]
  );

  const [routeWidth, setRouteWidth] = useState(1);
  const [routeHex, setRouteHex] = useState("#FFFFFF");
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<string>("upload");
  const [points, setPoints] = useState<LngLat[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeSteps, setRouteSteps] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const [routeLayerId, setRouteLayerId] = useState<string | undefined>();
  const [showPano, setShowPano] = useState(false);
  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const firstCoord = useMemo(() => {
    const first = points?.[0];
    if (!first) return undefined;

    const [lng, lat] = first;
    return { lat, lng };
  }, [points]);

  const addLineLayer = useCallback(
    (coords: LngLat[]) => {
      const routeFeature = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {}
      } as const;

      const layer = onLayerAdd?.({
        type: "simple",
        data: { type: "geojson", value: routeFeature },
        polyline: {
          clampToGround: true,
          hideIndicator: false,
          strokeColor: routeHex,
          strokeWidth: routeWidth || 1
        }
      });

      setPoints(coords);
      setRouteLayerId(layer?.id);
      const steps = dividesRoute(routeFeature);
      setRouteSteps(steps);
    },
    [onLayerAdd, routeHex, routeWidth]
  );

  const handleStartSketchRoute = useCallback(() => {
    onSketchSetType?.("polyline", "editor");
    setIsDrawing(true);
    setPoints([]);
  }, [onSketchSetType]);

  const finishDrawing = useCallback(() => {
    // NOTE:
    // Replace this with real sketch output when you wire sketch events.
    const coords: LngLat[] = [
      [13.608068822490395, -4.306859780511303],
      [23.936520262510157, 20.20929026138755]
    ];

    addLineLayer(coords);
    setPoints(coords); // ✅ store for street view

    const [lng, lat] = coords[0];
    onFlyTo?.({ lat, lng, height: 20000 }, { duration: 2 });

    setIsDrawing(false);
    onSketchSetType?.(undefined, "editor");
  }, [addLineLayer, onFlyTo, onSketchSetType]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      try {
        const json = JSON.parse(await file.text());

        const lines = extractLines(json).filter(
          (l) => Array.isArray(l) && l.length >= 2
        );
        if (!lines.length) throw new Error("No routes found in this file.");
        lines.forEach((coords) => addLineLayer(coords));
        const current = lines[0];
        setPoints(current);

        const first = current?.[0];
        if (first) {
          const [lng, lat] = first;
          onFlyTo?.(
            {
              lat,
              lng,
              height: 2000
            },
            { duration: 2 }
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    [addLineLayer, onFlyTo]
  );

  useEffect(() => {
    if (!routeLayerId) return;
    onLayerOverride?.(routeLayerId, {
      polyline: { strokeColor: routeHex, strokeWidth: routeWidth || 1 }
    });
  }, [routeHex, routeWidth, routeLayerId, onLayerOverride]);

  const disabled = useMemo(() => {
    if (
      (mode === "upload" && points.length > 1) ||
      (mode === "draw" && !isDrawing && points.length > 1) ||
      (mode === "select" && !!selectedRouteId)
    )
      return true;
    return false;
  }, [mode, isDrawing, points.length, selectedRouteId]);

  useEffect(() => {
    if (!showPano || !firstCoord || !panoDivRef.current) return;
    const { lat, lng } = firstCoord;
    (async () => {
      try {
        await loadGoogleMaps(apiKey);

        if (!panoRef.current) {
          panoRef.current = new google.maps.StreetViewPanorama(
            panoDivRef.current as HTMLElement,
            {
              position: { lat, lng },
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              addressControl: true,
              fullscreenControl: true
            }
          );
        } else {
          panoRef.current.setPosition({ lat, lng });
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [showPano, firstCoord, apiKey]);

  const handleStreetViewStart = useCallback(() => {
    setShowPano(true);
    if (!firstCoord) return;
  }, [firstCoord]);

  return {
    routeSteps,
    themeClass,
    routeWidth,
    disabled,
    panoDivRef,
    isDrawing,
    setRouteWidth,
    routeHex,
    setRouteHex,
    mode,
    setMode,
    selectedRouteId,
    setSelectedRouteId,
    showPano,
    handleStartSketchRoute,
    finishDrawing,
    handleUploadFile,
    handleStreetViewStart
  };
}
