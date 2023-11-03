import { useCallback } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";

export default (propertyId: string, schemaGroup: string) => {
  const { useUpdatePropertyValue, useAddPropertyItem, useRemovePropertyItem, useMovePropertyItem } =
    usePropertyFetcher();

  const handlePropertyValueUpdate = useCallback(
    (fieldId: string, vt: ValueType, itemId?: string) => {
      return async (v?: ValueTypes[ValueType]) => {
        await useUpdatePropertyValue(propertyId, schemaGroup, itemId, fieldId, "en", v, vt);
      };
    },
    [propertyId, schemaGroup, useUpdatePropertyValue],
  );

  const handleAddPropertyItem = useCallback(() => {
    return useAddPropertyItem(propertyId, schemaGroup);
  }, [propertyId, schemaGroup, useAddPropertyItem]);

  const handleRemovePropertyItem = useCallback(
    (itemId: string) => {
      return useRemovePropertyItem(propertyId, schemaGroup, itemId);
    },
    [propertyId, schemaGroup, useRemovePropertyItem],
  );

  const handleMovePropertyItem = useCallback(
    ({ id }: { id: string }, index: number) => {
      return useMovePropertyItem(propertyId, schemaGroup, id, index);
    },
    [propertyId, schemaGroup, useMovePropertyItem],
  );

  return {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
    handleRemovePropertyItem,
    handleMovePropertyItem,
  };
};
