import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo } from "react";

import type { Camera } from "@reearth/beta/lib/core/engines";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useCurrentCamera } from "@reearth/services/state";

import type { Field } from "../../../../types";
import usePropertyValueUpdate from "../../common/useActionPropertyApi";

export type CameraBlock = {
  id: string;
  title?: Field<string>;
  color?: Field<string>;
  bgColor?: Field<string>;
  cameraPosition?: Field<Camera>;
};

export default ({
  items,
  propertyId,
  selected,
}: {
  items: CameraBlock[];
  propertyId?: string;
  selected?: string;
}) => {
  const visualizer = useVisualizer();
  const [currentCamera] = useCurrentCamera();

  const handleFlyTo = useMemo(() => visualizer.current?.engine.flyTo, [visualizer]);

  const editorProperties = useMemo(() => items.find(i => i.id === selected), [items, selected]);

  const {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
    handleRemovePropertyItem,
    handleMovePropertyItem,
  } = usePropertyValueUpdate();

  const handleUpdate = useCallback(
    (
      itemId: string,
      fieldId: string,
      fieldType: keyof ValueTypes,
      updatedValue: ValueTypes[keyof ValueTypes],
    ) => {
      if (!propertyId || !itemId) return;

      handlePropertyValueUpdate("default", propertyId, fieldId, fieldType, itemId)(updatedValue);
    },
    [propertyId, handlePropertyValueUpdate],
  );

  const debounceOnUpdate = useMemo(() => debounce(handleUpdate, 500), [handleUpdate]);

  const listItems = useMemo(
    () => items.map(({ id, title }) => ({ id, value: title?.value ?? "New Camera" })),
    [items],
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyId) return;
    handleAddPropertyItem(propertyId, "default");
  }, [propertyId, handleAddPropertyItem]);

  const handleItemRemove = useCallback(
    (itemId: string) => {
      if (!propertyId || !itemId) return;

      handleRemovePropertyItem(propertyId, "default", itemId);
    },
    [propertyId, handleRemovePropertyItem],
  );

  const handleItemMove = useCallback(
    ({ id }: { id: string }, index: number) => {
      if (!propertyId || !id) return;

      handleMovePropertyItem(propertyId, "default", { id }, index);
    },
    [propertyId, handleMovePropertyItem],
  );

  // if there's no item add 1 button.
  // TODO: Should be added to block creationAPI for generic blocks that require at least 1 item
  useEffect(() => {
    if (!items || items.length === 0) {
      handleItemAdd();
      return;
    }
  }, [items, handleItemAdd, handleUpdate]);

  return {
    currentCamera,
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleUpdate,
    handleFlyTo,
    handleItemAdd,
    handleItemRemove,
    handleItemMove,
  };
};
