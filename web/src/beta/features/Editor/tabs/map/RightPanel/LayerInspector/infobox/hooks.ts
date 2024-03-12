import { useCallback, useMemo } from "react";

import { filterVisibleItems } from "@reearth/beta/components/fields/utils";
import { useInfoboxFetcher } from "@reearth/services/api";
import { Item, convert } from "@reearth/services/api/propertyApi/utils";

export default ({ layerId, property }: { layerId: string; property?: any }) => {
  const { useCreateNLSInfobox } = useInfoboxFetcher();
  //   const { useUpdatePropertyValue } = usePropertyFetcher();

  const visibleItems: Item[] | undefined = useMemo(
    () => filterVisibleItems(convert(property)),
    [property],
  );

  const handleInfoboxEnableChange = useCallback(async () => {
    if (!property) {
      const resp = await useCreateNLSInfobox({ layerId });
      console.log("NEW INFOBOX", resp);
    } else {
      //   const resp = await useUpdatePropertyValue({ propertyId });
      console.log("NEED TO UPDATE");
    }
  }, [layerId, property, useCreateNLSInfobox]);

  return {
    visibleItems,
    handleInfoboxEnableChange,
  };
};
