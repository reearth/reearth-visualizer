import {
  resolveTheme,
  useSystemTheme
} from "@reearth/app/lib/reearth-widget-ui/hooks/useSystemTheme";
import { coreContext, SketchEventProps } from "@reearth/core";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { Context } from "../..";
import { Widget } from "../../types";

import { Property, RouteFeature } from "./types";
import { loadGoogleMaps } from "./useStreetViewPlayer";
import { extractLines, toRouteFeature } from "./utils";

export type Props = {
  widget: Widget<Property>;
} & Context;

export default function useHooks({
  widget,
  onSketchSetType,
  onLayerAdd,
  onFlyTo,
  onLayerOverride,
  onLayerDelete
}: Props) {
  const { onSketchPluginFeatureCreate } = useContext(coreContext);

  const systemTheme = useSystemTheme();
  const themeClass = useMemo(
    () =>
      resolveTheme(widget.property?.appearance?.theme ?? "light", systemTheme),
    [widget.property?.appearance?.theme, systemTheme]
  );

  const [routeFeature, setRouteFeature] = useState<RouteFeature>();
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [routeLayerId, setRouteLayerId] = useState<string>();
  const [routeWidth, setRouteWidth] = useState(1);
  const [routeColor, setRouteColor] = useState("#ffffff");
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("upload");
  const [showPano, setShowPano] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const apiKey = useMemo(
    () => widget.property?.default?.apiKey,
    [widget.property?.default?.apiKey]
  );

  const selectRoutes = useMemo(
    () => widget.property?.routeFile,
    [widget.property?.routeFile]
  );

  const firstCoord = useMemo(() => {
    const c = routeFeature?.geometry?.coordinates?.[0];
    if (!c) return;
    const [lng, lat] = c;
    return { lat, lng };
  }, [routeFeature]);

  const handleChangeMode = useCallback((nextMode: string) => {
    setMode(nextMode);
    if (nextMode !== "upload") setFile(null);
    if (nextMode !== "select") setSelectedRoute("");
  }, []);

  const addLineLayer = useCallback(() => {
    if (!routeFeature) return;

    const layer = onLayerAdd?.({
      type: "simple",
      data: { type: "geojson", value: routeFeature },
      polyline: {
        clampToGround: true,
        hideIndicator: false,
        strokeColor: routeColor,
        strokeWidth: routeWidth || 1
      }
    });

    setRouteLayerId(layer?.id);
  }, [onLayerAdd, routeFeature, routeColor, routeWidth]);

  useEffect(() => {
    addLineLayer();
  }, [addLineLayer]);

  useEffect(() => {
    if (!routeLayerId) return;
    onLayerOverride?.(routeLayerId, {
      polyline: {
        strokeColor: routeColor,
        strokeWidth: routeWidth || 1
      }
    });
  }, [routeColor, routeWidth, routeLayerId, onLayerOverride]);

  const handleStartSketchRoute = useCallback(() => {
    onSketchSetType?.("polyline", "plugin");
    setIsDrawing(true);
    onLayerDelete?.(routeLayerId || "");
    handleChangeMode("draw");
  }, [handleChangeMode, onLayerDelete, onSketchSetType, routeLayerId]);

  const routeFeatureCreateHandler = useCallback(
    (e: SketchEventProps) => {
      if (!e.feature) return;

      const route = toRouteFeature(e.feature);
      if (!route) return;
      setRouteFeature(route);
      onSketchSetType?.(undefined, "plugin");
    },
    [onSketchSetType]
  );

  useEffect(() => {
    onSketchPluginFeatureCreate?.(routeFeatureCreateHandler);
  }, [onSketchPluginFeatureCreate, routeFeatureCreateHandler]);

  const handleFinishSketchRoute = useCallback(() => {
    if (!firstCoord) return;
    setIsDrawing(false);
    onFlyTo?.({ ...firstCoord, height: 2000 }, { duration: 2 });
  }, [firstCoord, onFlyTo]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      try {
        const json = JSON.parse(await file.text());
        const lines = extractLines(json);
        const route = toRouteFeature(lines[0]);
        if (!route) return;
        if (routeLayerId) {
          onLayerDelete?.(routeLayerId || "");
        }
        setRouteFeature(route);

        const [lng, lat] = route.geometry.coordinates[0];
        onFlyTo?.({ lat, lng, height: 2000 }, { duration: 2 });
        handleChangeMode("upload");
      } catch (e) {
        console.error(e);
      }
    },
    [handleChangeMode, onFlyTo, onLayerDelete, routeLayerId]
  );

  const handleSelectRoute = useCallback(
    async (value: string) => {
      try {
        setSelectedRoute(value);

        const res = await fetch(value);
        const json = await res.json();

        const lines = extractLines(json);
        if (!lines.length) return;

        const route = toRouteFeature(lines[0]);
        if (!route) return;
        if (routeLayerId) {
          onLayerDelete?.(routeLayerId || "");
        }

        setRouteFeature(route);
        handleChangeMode("select");

        const [lng, lat] = route.geometry.coordinates[0];
        onFlyTo?.({ lat, lng, height: 2000 }, { duration: 2 });
      } catch (e) {
        console.error(e);
      }
    },
    [handleChangeMode, onFlyTo, onLayerDelete, routeLayerId]
  );

  useEffect(() => {
    if (!showPano || !firstCoord || !panoDivRef.current) return;

    (async () => {
      try {
        await loadGoogleMaps(apiKey);

        if (!panoRef.current) {
          panoRef.current = new google.maps.StreetViewPanorama(
            panoDivRef.current as HTMLElement,
            {
              position: firstCoord,
              pov: { heading: 0, pitch: 0 },
              zoom: 1
            }
          );
        } else {
          panoRef.current.setPosition(firstCoord);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [showPano, firstCoord, apiKey]);

  const handleStreetViewStart = useCallback(() => {
    if (!firstCoord) return;
    setShowPano(true);
  }, [firstCoord]);

  const disabled = useMemo(() => {
    if (
      (mode === "upload" && !!routeFeature) ||
      (mode === "draw" && !isDrawing && !!routeFeature) ||
      (mode === "select" && !!selectedRoute)
    )
      return true;
    return false;
  }, [mode, isDrawing, routeFeature, selectedRoute]);

  return {
    themeClass,
    routeWidth,
    setRouteWidth,
    routeColor,
    setRouteColor,
    isDrawing,
    mode,
    setMode,
    file,
    setFile,
    disabled,
    panoDivRef,
    showPano,
    selectRoutes,
    selectedRoute,
    handleSelectRoute,
    handleStartSketchRoute,
    handleFinishSketchRoute,
    handleUploadFile,
    handleStreetViewStart
  };
}
