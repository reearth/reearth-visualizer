import { useCallback } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import { usePropertyFetcher } from "@reearth/services/api";

// Unlick common story blocks which will use the auto generted field components editor,
// Some special story blocks will use the custom editor components and need to update date directly.
export default () => {
  const { useUpdatePropertyValue, useAddPropertyItem } = usePropertyFetcher();

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
    (propertyId: string, schemaGroup: string) => {
      return useAddPropertyItem(propertyId, schemaGroup);
    },
    [useAddPropertyItem],
  );

  return {
    handlePropertyValueUpdate,
    handleAddPropertyItem,
  };
};
