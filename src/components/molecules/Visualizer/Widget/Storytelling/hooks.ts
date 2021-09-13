import { Math as CesiumMath } from "cesium";
import { useState, useCallback, useEffect, useMemo } from "react";

import { Camera as CameraValue } from "@reearth/util/value";

import { useVisualizerContext } from "../../context";
import type { Primitive } from "../../Primitive";

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
    primitive?: Primitive;
    duration: number;
    camera: CameraValue;
    range: number;
    noCameraFlight?: boolean;
  }>();

  const ctx = useVisualizerContext();
  const { flyTo, lookAt } = ctx?.engine ?? {};
  const selectPrimitive = ctx?.pluginAPI?.reearth.primitives.select;
  const { primitives, selectedPrimitive } = ctx ?? {};

  const stories = useMemo<Story[]>(() => {
    if (!storiesData || !primitives) return [];
    return storiesData.map(story => {
      const primitive = primitives.find(l => l.id === story.layer);
      return {
        ...story,
        title: story.title || primitive?.title || "",
      };
    });
  }, [primitives, storiesData]);

  const selectAt = useCallback(
    (index: number) => {
      const story = stories?.[index];
      if (!story) {
        select(undefined);
        return;
      }

      const id = story?.layer;

      const primitive = id ? primitives?.find(p => p.id === id) : undefined;
      select({
        index,
        story,
        primitive,
        duration,
        camera,
        range,
      });
      selectPrimitive?.(id, { reason: "storytelling" });
    },
    [camera, duration, primitives, range, selectPrimitive, stories],
  );

  const handleNext = useCallback(() => {
    selectAt(typeof selected?.index === "undefined" ? 0 : selected.index + 1);
  }, [selectAt, selected?.index]);

  const handlePrev = useCallback(() => {
    selectAt(typeof selected?.index === "undefined" ? 0 : selected.index - 1);
  }, [selectAt, selected?.index]);

  useEffect(() => {
    openMenu(false);
  }, [selectedPrimitive]);

  useEffect(() => {
    const id = selectedPrimitive?.id;
    const index = id ? stories?.findIndex(l => l.layer === id) : undefined;
    select(
      typeof index === "number" && index >= 0
        ? {
            index,
            story: stories[index],
            primitive: selectedPrimitive,
            duration,
            camera,
            range,
            noCameraFlight: true,
          }
        : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPrimitive]); // ignore camera, duration, range, stories

  useEffect(() => {
    if (
      !selected?.primitive ||
      selected.noCameraFlight ||
      // Photooverlays have own camera flight and that is the priority here.
      isPhotoOverlay(selected.primitive)
    ) {
      return;
    }

    if (selected.story.layerCamera) {
      flyTo?.(selected.story.layerCamera, {
        duration: selected.story.layerDuration ?? selected.duration,
      });
      return;
    }

    const p = selected.primitive?.property?.default;

    const position = {
      lat: (p?.location?.lat ?? p?.position?.lat) as number | undefined,
      lng: (p?.location?.lng ?? p?.position?.lng) as number | undefined,
      height: (p?.height as number | undefined) ?? 0,
    };

    if (typeof position.lat !== "number" && typeof position.lng !== "number") return;

    lookAt?.(
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

function isPhotoOverlay(primitive: Primitive): boolean {
  return (
    primitive.pluginId === "reearth" &&
    primitive.extensionId === "photooverlay" &&
    !!primitive.property?.default?.camera
  );
}
