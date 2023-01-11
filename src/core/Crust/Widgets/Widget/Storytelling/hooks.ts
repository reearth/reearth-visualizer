import { Math as CesiumMath } from "cesium";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import { Camera, FlyToDestination, LookAtDestination } from "../types";

export type Story = {
  title: string;
  layer?: string;
  layerDuration?: number;
  layerRange?: number;
  layerCamera?: Camera;
};

const defaultRange = 50000;
const defaultDuration = 3;
const defaultCamera: Camera = {
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
  selectedLayerId,
  onFlyTo: flyTo,
  onLookAt: lookAt,
  onLayerSelect: selectLayer,
  findPhotooverlayLayer,
}: {
  duration?: number;
  camera?: Camera;
  range?: number;
  autoStart?: boolean;
  stories?: Story[];
  selectedLayerId?: string;
  onFlyTo?: (camera: FlyToDestination, options?: { duration?: number }) => void;
  onLookAt?: (camera: LookAtDestination, options?: { duration?: number }) => void;
  onLayerSelect?: (id: string | undefined, options?: { reason?: string }) => void;
  findPhotooverlayLayer?: (
    id: string,
  ) => { title?: string; lat: number; lng: number; height: number } | undefined;
}) {
  const [menuOpen, openMenu] = useState(false);
  const toggleMenu = useCallback(() => openMenu(o => !o), []);

  const [selected, select] = useState<{
    index: number;
    story: Story;
    duration: number;
    camera: Camera;
    range: number;
    noCameraFlight?: boolean;
  }>();

  const selectedLayer = useMemo(
    () => (selectedLayerId ? findPhotooverlayLayer?.(selectedLayerId) : undefined),
    [findPhotooverlayLayer, selectedLayerId],
  );

  const timeout = useRef<number>();

  useEffect(
    () => () => {
      window.clearTimeout(timeout.current);
    },
    [],
  );

  const stories = useMemo<Story[]>(() => {
    if (!storiesData || !findPhotooverlayLayer) return [];
    return storiesData.map(story => ({
      ...story,
      title: story.title || (story.layer && findPhotooverlayLayer?.(story.layer)?.title) || "",
    }));
  }, [findPhotooverlayLayer, storiesData]);

  const selectAt = useCallback(
    (index: number) => {
      const story = stories?.[index];
      if (!story) {
        select(undefined);
        return;
      }

      const id = story?.layer;
      select({
        index,
        story,
        duration,
        camera,
        range,
      });
      selectLayer?.(id, { reason: "storytelling" });
    },
    [camera, duration, range, selectLayer, stories],
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
    const id = selectedLayerId;
    const index = id ? stories?.findIndex(l => l.layer === id) : undefined;
    select(
      typeof index === "number" && index >= 0
        ? {
            index,
            story: stories[index],
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
    if (!selected || !selectedLayer || selected.noCameraFlight) {
      return;
    }

    if (selected.story.layerCamera) {
      flyTo?.(selected.story.layerCamera, {
        duration: selected.story.layerDuration ?? selected.duration,
      });
      return;
    }

    const position = {
      lat: selectedLayer?.lat,
      lng: selectedLayer?.lng,
      height: selectedLayer?.height ?? 0,
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
  }, [flyTo, lookAt, selected, selectedLayer]);

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
