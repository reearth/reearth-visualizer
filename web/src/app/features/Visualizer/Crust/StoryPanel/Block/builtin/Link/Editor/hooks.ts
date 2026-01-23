import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { useT } from "@reearth/services/i18n/hooks";
import { debounce } from "lodash-es";
import { useCallback, useMemo } from "react";

import type { Field } from "../../../../types";

export type LinkBlock = {
  id: string;
  title?: Field<string>;
  color?: Field<string>;
  bgColor?: Field<string>;
  url?: Field<URL>;
};

export default ({
  items,
  propertyId,
  selected,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemDelete,
  onPropertyItemMove
}: {
  items: LinkBlock[];
  propertyId?: string;
  selected?: string;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
}) => {
  const t = useT();

  const editorProperties = useMemo(
    () => items.find((i) => i.id === selected),
    [items, selected]
  );

  const handlePropertyValueUpdate = useCallback(
    (
      schemaGroupId: string,
      propertyId: string,
      fieldId: string,
      vt: ValueType,
      itemId?: string
    ) => {
      return async (v?: ValueTypes[ValueType]) => {
        await onPropertyUpdate?.(
          propertyId,
          schemaGroupId,
          fieldId,
          itemId,
          vt,
          v
        );
      };
    },
    [onPropertyUpdate]
  );

  const handleUpdate = useCallback(
    (
      itemId: string,
      fieldId: string,
      fieldType: keyof ValueTypes,
      updatedValue?: ValueTypes[keyof ValueTypes]
    ) => {
      if (!propertyId || !itemId) return;

      handlePropertyValueUpdate(
        "default",
        propertyId,
        fieldId,
        fieldType,
        itemId
      )(updatedValue);
    },
    [propertyId, handlePropertyValueUpdate]
  );

  const debounceOnUpdate = useMemo(
    () => debounce(handleUpdate, 500),
    [handleUpdate]
  );

  const listItems = useMemo(
    () =>
      items.map(({ id, title }) => ({
        id,
        title: title?.value ?? t("New Link Button")
      })),
    [items, t]
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
    [propertyId, onPropertyItemDelete]
  );

  const handleItemMove = useCallback(
    (id: string, index: number) => {
      if (!propertyId || !id) return;

      onPropertyItemMove?.(propertyId, "default", id, index);
    },
    [propertyId, onPropertyItemMove]
  );

  return {
    editorProperties,
    debounceOnUpdate,
    listItems,
    handleUpdate,
    handleItemAdd,
    handleItemRemove,
    handleItemMove
  };
};
