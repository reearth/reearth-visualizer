import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import { useInfoboxFetcher } from "@reearth/services/api";
import { Item, convert } from "@reearth/services/api/propertyApi/utils";
import { useCallback, useMemo } from "react";

export default ({ layerId, property }: { layerId: string; property?: any }) => {
  const { useCreateNLSInfobox } = useInfoboxFetcher();
  //   const { useUpdatePropertyValue } = usePropertyFetcher();

  const visibleItems: Item[] | undefined = useMemo(
    () => filterVisibleItems(convert(property)),
    [property]
  );

  const handleInfoboxCreate = useCallback(async () => {
    if (!property) {
      await useCreateNLSInfobox({ layerId });
    }
  }, [layerId, property, useCreateNLSInfobox]);

  return {
    visibleItems,
    handleInfoboxCreate
  };
};
