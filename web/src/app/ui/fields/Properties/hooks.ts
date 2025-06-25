import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";
import { useCallback } from "react";

export default (propertyId: string, schemaGroup: string) => {
  const {
    useUpdatePropertyValue,
    useAddPropertyItem,
    useRemovePropertyItem,
    useMovePropertyItem
  } = usePropertyFetcher();

  const handlePropertyItemUpdate = useCallback(
    (fieldId: string, vt: ValueType, itemId?: string) => {
      return async (v?: ValueTypes[ValueType]) => {
        await useUpdatePropertyValue(
          propertyId,
          schemaGroup,
          itemId,
          fieldId,
          "en",
          v,
          vt
        );
      };
    },
    [propertyId, schemaGroup, useUpdatePropertyValue]
  );

  const handlePropertyItemAdd = useCallback(() => {
    return useAddPropertyItem(propertyId, schemaGroup);
  }, [propertyId, schemaGroup, useAddPropertyItem]);

  const handlePropertyItemDelete = useCallback(
    (itemId: string) => {
      return useRemovePropertyItem(propertyId, schemaGroup, itemId);
    },
    [propertyId, schemaGroup, useRemovePropertyItem]
  );

  const handlePropertyItemMove = useCallback(
    (id: string, index: number) => {
      return useMovePropertyItem(propertyId, schemaGroup, id, index);
    },
    [propertyId, schemaGroup, useMovePropertyItem]
  );

  return {
    handlePropertyItemUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove
  };
};
