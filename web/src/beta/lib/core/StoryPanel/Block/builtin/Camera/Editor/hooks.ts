import { debounce } from "lodash-es";
import { useCallback, useMemo } from "react";

import type { Camera } from "@reearth/beta/lib/core/engines";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { useCurrentCamera } from "@reearth/services/state";

import type { Field } from "../../../../types";

export type CameraBlock = {
  id: string;
  title?: Field<string>;
  color?: Field<string>;
  bgColor?: Field<string>;
  cameraPosition?: Field<Camera>;
  cameraDuration?: Field<number>;
};

export default ({
  items,
  propertyId,
  selected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove,
}: {
  items: CameraBlock[];
  propertyId?: string;
  selected?: string;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
}) => {
  const visualizer = useVisualizer();
  const [currentCamera] = useCurrentCamera();
  const t = useT();

  const handleFlyTo = useMemo(() => visualizer.current?.engine.flyTo, [visualizer]);

  const editorProperties = useMemo(() => items.find(i => i.id === selected), [items, selected]);

  const handlePropertyValueUpdate = useCallback(
    (schemaGroupId: string, propertyId: string, fieldId: string, vt: any, itemId?: string) => {
      return async (v?: any) => {
        await onPropertyUpdate?.(propertyId, schemaGroupId, fieldId, itemId, vt, v);
      };
    },
    [onPropertyUpdate],
  );

  const handleUpdate = useCallback(
    (
      itemId: string,
      fieldId: string,
      fieldType: keyof ValueTypes,
      updatedValue?: ValueTypes[keyof ValueTypes],
    ) => {
      if (!propertyId || !itemId) return;

      handlePropertyValueUpdate("default", propertyId, fieldId, fieldType, itemId)(updatedValue);
    },
    [propertyId, handlePropertyValueUpdate],
  );

  const debounceOnUpdate = useMemo(() => debounce(handleUpdate, 500), [handleUpdate]);

  const listItems = useMemo(
    () => items.map(({ id, title }) => ({ id, value: title?.value ?? t("New Camera Button") })),
    [items, t],
  );

  const handleItemAdd = useCallback(() => {
    if (!propertyId) return;
    onPropertyItemAdd?.(propertyId, "default");
  }, [propertyId, onPropertyItemAdd]);

  const handleItemRemove = useCallback(
    (itemId: string) => {
      if (!propertyId || !itemId) return;

      onPropertyItemDelete?.(propertyId, "default", itemId);
    },
    [propertyId, onPropertyItemDelete],
  );

  const handleItemMove = useCallback(
    ({ id }: { id: string }, index: number) => {
      if (!propertyId || !id) return;

      onPropertyItemMove?.(propertyId, "default", id, index);
    },
    [propertyId, onPropertyItemMove],
  );

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
