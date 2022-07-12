import { Math as CesiumMath } from "cesium";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import { Camera as CameraValue } from "@reearth/util/value";

import { useContext } from "../../Plugin";
import type { Layer } from "../../Plugin";
import type { CommonReearth } from "../../Plugin/api";

export type Story = {
  title: string;
  layer?: string;
  layerDuration?: number;
  layerRange?: number;
  layerCamera?: CameraValue;
};

const defaultRange = 50000;
const defaultDuration = 3;
const defaultCamera = {
  lat: 0,
  lng: 0,
  height: 0,
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-30),
  roll: 0,
  fov: CesiumMath.toRadians(60),
};

export default function ({
  duration = defaultDuration,
  range = defaultRange,
  camera = defaultCamera,
  autoStart,
  stories: storiesData,
}: {
  duration?: number;
  camera?: CameraValue;
  range?: number;
  autoStart?: boolean;
  stories?: Story[];
}) {
  const [menuOpen, openMenu] = useState(false);
  const toggleMenu = useCallback(() => openMenu(o => !o), []);

  const [selected, select] = useState<{
    index: number;
    story: Story;
    layer?: Layer;
    duration: number;
    camera: CameraValue;
    range: number;
    noCameraFlight?: boolean;
  }>();

  const { reearth } = useContext() ?? {};
  const {
    findById: findLayerById,
    selected: selectedLayer,
    select: selectLayer,
  } = reearth?.layers ?? {};

  const timeout = useRef<number>();

  const flyTo = useCallback(
    (...args: Parameters<CommonReearth["visualizer"]["camera"]["lookAt"]>) => {
      // Prioritize camera flight by the photo overlay
      timeout.current = window.setTimeout(() => {
        reearth?.visualizer.camera.flyTo(...args);
      }, 100);
    },
    [reearth?.visualizer.camera],
  );

  const lookAt = useCallback(
    (...args: Parameters<CommonReearth["visualizer"]["camera"]["lookAt"]>) => {
      // Prioritize camera flight by the photo overlay
      timeout.current = window.setTimeout(() => {
        reearth?.visualizer.camera.lookAt(...args);
      }, 100);
    },
    [reearth?.visualizer.camera],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
    },
    [],
  );

  const stories = useMemo<Story[]>(() => {
    if (!storiesData || !findLayerById) return [];
    return storiesData.map(story => ({
      ...story,
      title: story.title || (story.layer && findLayerById?.(story.layer)?.title) || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findLayerById, storiesData, reearth?.layers?.layers]);

  const selectAt = useCallback(
    (index: number) => {
      const story = stories?.[index];
      if (!story) {
        select(undefined);
        return;
      }

      const id = story?.layer;
      const layer = id ? findLayerById?.(id) : undefined;
      select({
        index,
        story,
        layer,
        duration,
        camera,
        range,
      });
      selectLayer?.(id, { reason: "storytelling" });
    },
    [camera, duration, findLayerById, range, selectLayer, stories],
  );

  const handleNext = useCallback(() => {
    selectAt(typeof selected?.index === "undefined" ? 0 : selected.index + 1);
  }, [selectAt, selected?.index]);

  const handlePrev = useCallback(() => {
    selectAt(typeof selected?.index === "undefined" ? 0 : selected.index - 1);
  }, [selectAt, selected?.index]);

  useEffect(() => {
    openMenu(false);
  }, [selectedLayer]);

  useEffect(() => {
    const id = selectedLayer?.id;
    const index = id ? stories?.findIndex(l => l.layer === id) : undefined;
    select(
      typeof index === "number" && index >= 0
        ? {
            index,
            story: stories[index],
            layer: selectedLayer,
            duration,
            camera,
            range,
            noCameraFlight: true,
          }
        : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLayer]); // ignore camera, duration, range, stories

  useEffect(() => {
    if (
      !selected?.layer ||
      selected.noCameraFlight ||
      // Photooverlays have own camera flight and that is the priority here.
      isPhotoOverlay(selected.layer)
    ) {
      return;
    }

    if (selected.story.layerCamera) {
      flyTo(selected.story.layerCamera, {
        duration: selected.story.layerDuration ?? selected.duration,
      });
      return;
    }

    const p = selected.layer?.property?.default;

    const position = {
      lat: (p?.location?.lat ?? p?.position?.lat) as number | undefined,
      lng: (p?.location?.lng ?? p?.position?.lng) as number | undefined,
      height: (p?.height as number | undefined) ?? 0,
    };

    if (typeof position.lat !== "number" && typeof position.lng !== "number") return;

    lookAt(
      {
        ...position,
        heading: selected.camera.heading,
        pitch: selected.camera.pitch,
        range: selected.story.layerRange ?? selected.range,
      },
      {
        duration: selected.story.layerDuration ?? selected.duration,
      },
    );
  }, [flyTo, lookAt, selected]);

  useEffect(() => {
    if (!autoStart) return;
    selectAt(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]); // ignore selectAt

  return {
    stories,
    menuOpen,
    selected,
    handleNext,
    handlePrev,
    selectAt,
    openMenu,
    toggleMenu,
  };
}

function isPhotoOverlay(layer: Layer): boolean {
  return (
    layer.pluginId === "reearth" &&
    layer.extensionId === "photooverlay" &&
    !!layer.property?.default?.camera
  );
}
