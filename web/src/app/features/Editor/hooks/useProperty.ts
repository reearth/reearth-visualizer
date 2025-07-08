import { usePropertyFetcher } from "@reearth/services/api";
import { useCallback } from "react";

export default () => {
  const { useUpdatePropertyValue } = usePropertyFetcher();
  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: unknown,
      v?: unknown
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(
        propertyId,
        schemaItemId,
        itemId,
        fieldId,
        "en",
        v as string | number | boolean | unknown[] | undefined,
        vt as keyof import("@reearth/core").ValueTypes
      );
    },
    [useUpdatePropertyValue]
  );

  return {
    handlePropertyValueUpdate
  };
};
