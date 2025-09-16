import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import { useInfoboxMutations } from "@reearth/services/api/infobox";
import type { Item } from "@reearth/services/api/property";
import { convert } from "@reearth/services/api/property/utils";
import { useCallback, useMemo } from "react";

export default ({ layerId, property }: { layerId: string; property?: any }) => {
  const { createNLSInfobox } = useInfoboxMutations();

  const visibleItems: Item[] | undefined = useMemo(
    () => filterVisibleItems(convert(property)),
    [property]
  );

  const handleInfoboxCreate = useCallback(async () => {
    if (!property) {
      await createNLSInfobox({ layerId });
    }
  }, [layerId, property, createNLSInfobox]);

  return {
    visibleItems,
    handleInfoboxCreate
  };
};
