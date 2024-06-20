import { useCallback } from "react";

import { usePropertyFetcher } from "@reearth/services/api";

export default () => {
  const { useUpdatePropertyValue } = usePropertyFetcher();
  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: any,
      v?: any,
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(propertyId, schemaItemId, itemId, fieldId, "en", v, vt);
    },
    [useUpdatePropertyValue],
  );

  return {
    handlePropertyValueUpdate,
  };
};
