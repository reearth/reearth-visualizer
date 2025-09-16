import { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useCallback } from "react";

export default (propertyId: string, schemaGroup: string) => {
  const {
    updatePropertyValue,
    addPropertyItem,
    removePropertyItem,
    movePropertyItem
  } = usePropertyMutations();

  const handlePropertyItemUpdate = useCallback(
    (fieldId: string, vt: ValueType, itemId?: string) => {
      return async (v?: ValueTypes[ValueType]) => {
        await updatePropertyValue(
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
    [propertyId, schemaGroup, updatePropertyValue]
  );

  const handlePropertyItemAdd = useCallback(() => {
    return addPropertyItem(propertyId, schemaGroup);
  }, [propertyId, schemaGroup, addPropertyItem]);

  const handlePropertyItemDelete = useCallback(
    (itemId: string) => {
      return removePropertyItem(propertyId, schemaGroup, itemId);
    },
    [propertyId, schemaGroup, removePropertyItem]
  );

  const handlePropertyItemMove = useCallback(
    (id: string, index: number) => {
      return movePropertyItem(propertyId, schemaGroup, id, index);
    },
    [propertyId, schemaGroup, movePropertyItem]
  );

  return {
    handlePropertyItemUpdate,
    handlePropertyItemAdd,
    handlePropertyItemDelete,
    handlePropertyItemMove
  };
};
