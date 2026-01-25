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

import { CAMERA_HEIGHT_WITHOUT_TERRAIN, CAMERA_PITCH } from "./constants";
import { Property, RouteFeature, RouteInputData } from "./types";
import { loadGoogleMaps } from "./useStreetViewPlayer";
import { dividesRoute, extractLines, toRouteFeature } from "./utils";

export type Props = {
  widget: Widget<Property>;
} & Context;

type PlayState = "idle" | "playing" | "paused";

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

  const [routeState, setRouteState] = useState<{
    feature?: RouteFeature;
    layerId?: string;
  }>({});

  const [trackingPointId, setTrackingPointId] = useState<string>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("upload");

  const [routeInputData, setRouteInputData] = useState<RouteInputData>({
    routeWidth: 1,
    routeColor: "#ffffff",
    file: null,
    selectedRoute: ""
  });

  const updateRouteInputData = useCallback(
    (
      patch:
        | Partial<RouteInputData>
        | ((prev: RouteInputData) => Partial<RouteInputData>)
    ) => {
      setRouteInputData((prev) => ({
        ...prev,
        ...(typeof patch === "function" ? patch(prev) : patch)
      }));
    },
    []
  );

  const [showPano, setShowPano] = useState(false);
  const [panoReady, setPanoReady] = useState(false);
  const [playState, setPlayState] = useState<PlayState>("idle");

  const [streetViewCoords, setStreetViewCoords] = useState<
    { lat: number; lng: number }[]
  >([]);

  const handleChangeMode = useCallback(
    (nextMode: string) => {
      setMode(nextMode);
      updateRouteInputData((prev) => ({
        file: nextMode !== "upload" ? null : prev.file,
        selectedRoute: nextMode !== "select" ? "" : prev.selectedRoute
      }));
    },
    [updateRouteInputData]
  );

  const panoDivRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const flyIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const apiKey = widget.property?.default?.apiKey;
  const selectRoutes = widget.property?.routeFile;

  const firstCoord = useMemo(() => {
    const c = routeState.feature?.geometry?.coordinates?.[0];
    if (!c) return;
    const [lng, lat] = c;
    return { lat, lng };
  }, [routeState.feature]);

  const clearAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const upsertRouteLayer = useCallback(
    (feature?: RouteFeature) => {
      if (!feature) return;

      const style = {
        clampToGround: true,
        hideIndicator: false,
        strokeColor: routeInputData.routeColor,
        strokeWidth: routeInputData.routeWidth || 1
      };

      if (!routeState.layerId) {
        const layer = onLayerAdd?.({
          type: "simple",
          data: { type: "geojson", value: feature },
          polyline: style
        });

        setRouteState((prev) => ({
          ...prev,
          layerId: layer?.id
        }));
        return;
      }

      onLayerOverride?.(routeState.layerId, {
        data: { type: "geojson", value: feature },
        polyline: style
      });
    },
    [
      routeState.layerId,
      routeInputData.routeColor,
      routeInputData.routeWidth,
      onLayerAdd,
      onLayerOverride
    ]
  );

  const updateTrackingPoint = useCallback(
    (coord: { lat: number; lng: number }) => {
      const feature = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [coord.lng, coord.lat]
        }
      };

      if (!trackingPointId) {
        const layer = onLayerAdd?.({
          type: "simple",
          data: { type: "geojson", value: feature },
          marker: {
            style: "point",
            pointColor: "#ffffff",
            pointSize: 10
          }
        });
        setTrackingPointId(layer?.id);
      } else {
        onLayerOverride?.(trackingPointId, {
          data: { type: "geojson", value: feature }
        });
      }
    },
    [trackingPointId, onLayerAdd, onLayerOverride]
  );

  useEffect(() => {
    upsertRouteLayer(routeState.feature);
  }, [routeState.feature, upsertRouteLayer]);

  useEffect(() => {
    onSketchPluginFeatureCreate?.((e: SketchEventProps) => {
      if (!e.feature) return;
      const route = toRouteFeature(e.feature);
      if (!route) return;

      setRouteState((prev) => ({
        ...prev,
        feature: route
      }));

      onSketchSetType?.(undefined, "plugin");
    });
  }, [onSketchPluginFeatureCreate, onSketchSetType]);

  useEffect(() => {
    if (!showPano || !panoDivRef.current) return;
    const pos = streetViewCoords[0] ?? firstCoord;
    if (!pos) return;

    (async () => {
      await loadGoogleMaps(apiKey);

      if (!panoRef.current) {
        panoRef.current = new google.maps.StreetViewPanorama(
          panoDivRef.current as HTMLElement,
          {
            position: pos,
            pov: { heading: 0, pitch: 0 },
            zoom: 1
          }
        );
      } else {
        panoRef.current.setPosition(pos);
      }
      setPanoReady(true);
    })();
  }, [showPano, streetViewCoords, firstCoord, apiKey]);

  const startAnimation = useCallback(() => {
    if (!streetViewCoords.length) return;

    clearAnimation();
    setPlayState("playing");

    const step = () => {
      const i = flyIndexRef.current;
      const current = streetViewCoords[i];
      const next = streetViewCoords[i + 1];

      if (!current || !next) {
        clearAnimation();
        setPlayState("idle");
        return;
      }

      const heading = google.maps.geometry.spherical.computeHeading(
        current,
        next
      );

      panoRef.current?.setPosition(current);
      panoRef.current?.setPov({ heading, pitch: 10 });

      updateTrackingPoint(next);

      onFlyTo?.(
        {
          lat: current.lat,
          lng: current.lng,
          height: CAMERA_HEIGHT_WITHOUT_TERRAIN,
          pitch: CAMERA_PITCH,
          heading: heading * (Math.PI / 180)
        },
        { duration: 2 }
      );

      flyIndexRef.current++;
    };

    step();
    intervalRef.current = window.setInterval(step, 3000);
  }, [streetViewCoords, updateTrackingPoint, onFlyTo, clearAnimation]);

  useEffect(() => {
    if (!showPano || !panoReady) return;
    startAnimation();
    return clearAnimation;
  }, [showPano, panoReady, startAnimation, clearAnimation]);

  const handleStartSketchRoute = useCallback(() => {
    onSketchSetType?.("polyline", "plugin");
    setIsDrawing(true);

    if (routeState.layerId) onLayerDelete?.(routeState.layerId);

    setRouteState({});
    handleChangeMode("draw");
  }, [onSketchSetType, routeState.layerId, onLayerDelete, handleChangeMode]);

  const handleFinishSketchRoute = useCallback(() => {
    if (!firstCoord) return;
    setIsDrawing(false);
    onFlyTo?.({ ...firstCoord, height: 2000 }, { duration: 2 });
  }, [firstCoord, onFlyTo]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      updateRouteInputData({ file });

      const json = JSON.parse(await file.text());
      const route = toRouteFeature(extractLines(json)[0]);
      if (!route) return;

      if (routeState.layerId) onLayerDelete?.(routeState.layerId);

      setRouteState({ feature: route });

      const [lng, lat] = route.geometry.coordinates[0];
      onFlyTo?.({ lat, lng, height: 2000 }, { duration: 2 });

      handleChangeMode("upload");
    },
    [
      updateRouteInputData,
      routeState.layerId,
      onLayerDelete,
      onFlyTo,
      handleChangeMode
    ]
  );

  const handleSelectRoute = useCallback(
    async (value: string) => {
      updateRouteInputData({ selectedRoute: value });

      const json = await (await fetch(value)).json();
      const route = toRouteFeature(extractLines(json)[0]);
      if (!route) return;

      if (routeState.layerId) onLayerDelete?.(routeState.layerId);

      setRouteState({ feature: route });

      const [lng, lat] = route.geometry.coordinates[0];
      onFlyTo?.({ lat, lng, height: 2000 }, { duration: 2 });

      handleChangeMode("select");
    },
    [
      updateRouteInputData,
      routeState.layerId,
      onLayerDelete,
      onFlyTo,
      handleChangeMode
    ]
  );

  const handleStreetViewStart = useCallback(() => {
    if (!routeState.feature) return;

    const coords = dividesRoute({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeState.feature.geometry.coordinates
      }
    });

    if (!coords.length) return;

    setStreetViewCoords(coords);
    setPanoReady(false);
    setShowPano(true);
    setPlayState("paused");
  }, [routeState.feature]);

  const handlePause = useCallback(() => {
    clearAnimation();
    setPlayState("paused");
  }, [clearAnimation]);

  const handleResume = useCallback(() => {
    if (!streetViewCoords.length) return;
    setPlayState("playing");
    startAnimation();
  }, [streetViewCoords.length, startAnimation]);

  const handleRestart = useCallback(() => {
    if (!streetViewCoords.length) return;

    clearAnimation();
    flyIndexRef.current = 0;
    updateTrackingPoint(streetViewCoords[0]);
    setPlayState("playing");
    startAnimation();
  }, [streetViewCoords, updateTrackingPoint, startAnimation, clearAnimation]);

  const resetOnClose = useCallback(() => {
    clearAnimation();

    setShowPano(false);
    setPanoReady(false);
    panoRef.current = null;

    if (routeState.layerId) onLayerDelete?.(routeState.layerId);
    if (trackingPointId) onLayerDelete?.(trackingPointId);

    setRouteState({});
    setTrackingPointId(undefined);

    setMode("upload");
    setRouteInputData({
      routeWidth: 1,
      routeColor: "#ffffff",
      file: null,
      selectedRoute: ""
    });

    setPlayState("idle");
    flyIndexRef.current = 0;
    setStreetViewCoords([]);
  }, [clearAnimation, onLayerDelete, routeState.layerId, trackingPointId]);


  const disabled = useMemo(
    () =>
      (mode === "upload" && !!routeState.feature) ||
      (mode === "draw" && !isDrawing && !!routeState.feature) ||
      (mode === "select" && !!routeInputData.selectedRoute),
    [mode, isDrawing, routeState.feature, routeInputData.selectedRoute]
  );

  return {
    themeClass,
    routeInputData,
    updateRouteInputData,
    isDrawing,
    mode,
    disabled,
    panoDivRef,
    showPano,
    playState,
    selectRoutes,
    handleChangeMode,
    handleSelectRoute,
    handleStartSketchRoute,
    handleFinishSketchRoute,
    handleUploadFile,
    handlePause,
    handleRestart,
    handleResume,
    handleStreetViewStart,
    resetOnClose
  };
}
