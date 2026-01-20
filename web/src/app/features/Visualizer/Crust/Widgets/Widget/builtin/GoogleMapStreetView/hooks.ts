import * as turf from "@turf/turf";
import { useCallback, useEffect, useMemo, useState } from "react";

type LngLat = [number, number]; // [lng, lat]

export default () => {

  const [routeWidth, setRouteWidth] = useState<number>(1);
  const [routeHex, setRouteHex] = useState<string>("#FFFFFF");
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<LngLat[]>([]);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    console.log("called")
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { action?: string; payload?: any };
      if (data?.action !== "pointAdded") return;

      const { lng, lat } = data.payload ?? {};
      if (typeof lng !== "number" || typeof lat !== "number") return;

      setPoints((prev) => [...prev, [lng, lat]]);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { action?: string; payload?: any };
      if (data?.action !== "getApiKey") return;

      const k = data.payload;
      if (typeof k === "string") setApiKey(k);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const routeGeojson = useMemo(() => {
    if (points.length < 2) return null;

    const fc = turf.featureCollection([turf.lineString(points)]);
    fc.features[0].properties = {
      ...(fc.features[0].properties ?? {}),
      stroke: routeHex,
      "stroke-width": routeWidth
    };
    return fc;
  }, [points, routeHex, routeWidth]);

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setPoints([]);
  }, []);

  const finishDrawing = useCallback(() => {
    setIsDrawing(false);

    if (routeGeojson) {
      const coord = points[0];
      console.log("route start coord:", coord);
    }
  }, [points, routeGeojson]);

  return {
    apiKey,
    points,
    routeWidth,
    setRouteWidth,
    routeHex,
    setRouteHex,
    isDrawing,
    startDrawing,
    finishDrawing
  };
};
