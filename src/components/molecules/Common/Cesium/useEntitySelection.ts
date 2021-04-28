import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Entity, Viewer } from "cesium";
import { CesiumComponentRef, CesiumMovementEvent } from "resium";

export default function useEntitySelection(
  cesium: RefObject<CesiumComponentRef<Viewer>>,
  selectedEntityId?: string,
  onEntitySelect?: (id?: string) => void,
) {
  const prevSelected = useRef(selectedEntityId);
  const [selected, setSelected] = useState<[string | undefined, string | undefined]>([
    selectedEntityId,
    undefined,
  ]);

  const selectEntity = useCallback(
    (id?: string, reason?: string) => {
      prevSelected.current = id;
      setSelected([id, reason]);
      onEntitySelect?.(id);
    },
    [onEntitySelect],
  );

  const selectViewerEntity = useCallback(
    (_: CesiumMovementEvent, target: any) => {
      if (!(target instanceof Entity)) {
        prevSelected.current = undefined;
        setSelected([undefined, undefined]);
        onEntitySelect?.(undefined);
        return;
      }

      if (selectable(target)) {
        prevSelected.current = target.id;
        setSelected([target.id, undefined]);
        onEntitySelect?.(target.id);
      }
    },
    [onEntitySelect],
  );

  useEffect(() => {
    setSelected(([, reason]) => [
      selectedEntityId,
      prevSelected.current === selectedEntityId ? reason : undefined,
    ]);
    prevSelected.current = selectedEntityId;
  }, [cesium, selectedEntityId]);

  useEffect(() => {
    const viewer = cesium.current?.cesiumElement;
    if (viewer && !viewer.isDestroyed()) {
      (viewer.selectedEntity as Entity | undefined) = selected[0]
        ? viewer.entities.getById(selected[0])
        : undefined;
    }
  }, [cesium, selected]);

  return {
    selected,
    selectEntity,
    selectViewerEntity,
  };
}

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};
