import { useCallback } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";

export default () => {
  const { useUpdatePropertyValue, useAddPropertyItem, useRemovePropertyItem, useMovePropertyItem } =
    usePropertyFetcher();

  const handlePropertyValueUpdate = useCallback(
    (
      schemaGroupId: string,
      propertyId: string,
      fieldId: string,
      vt: ValueType,
      itemId?: string,
    ) => {
      return async (v?: ValueTypes[ValueType]) => {
        await useUpdatePropertyValue(propertyId, schemaGroupId, itemId, fieldId, "en", v, vt);
      };
    },
    [useUpdatePropertyValue],
  );

  const handleAddPropertyItem = useCallback(
    (propertyId: string, schemaGroupId: string) => {
      return useAddPropertyItem(propertyId, schemaGroupId);
    },
    [useAddPropertyItem],
  );

  const handleRemovePropertyItem = useCallback(
    (propertyId: string, schemaGroupId: string, itemId: string) => {
      return useRemovePropertyItem(propertyId, schemaGroupId, itemId);
    },
    [useRemovePropertyItem],
  );

  const handleMovePropertyItem = useCallback(
    (propertyId: string, schemaGroupId: string, itemId: string, index: number) => {
      return useMovePropertyItem(propertyId, schemaGroupId, itemId, index);
    },
    [useMovePropertyItem],
  );

  return {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
    handleRemovePropertyItem,
    handleMovePropertyItem,
  };
};
