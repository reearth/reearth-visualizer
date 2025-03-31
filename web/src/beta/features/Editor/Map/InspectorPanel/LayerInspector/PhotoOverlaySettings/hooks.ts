import { filterVisibleItems } from "@reearth/beta/ui/fields/utils";
import { usePhotoOverlayFetcher } from "@reearth/services/api";
import { Item, convert } from "@reearth/services/api/propertyApi/utils";
import { useCallback, useMemo } from "react";

export default ({ layerId, property }: { layerId: string; property?: any }) => {
  const { useCreateNLSPhotoOverlay } = usePhotoOverlayFetcher();

  const visibleItems: Item[] | undefined = useMemo(
    () => filterVisibleItems(convert(property)),
    [property]
  );

  const handlePhotoOverlayCreate = useCallback(async () => {
    if (!property) {
      await useCreateNLSPhotoOverlay({ layerId });
    }
  }, [layerId, property, useCreateNLSPhotoOverlay]);

  return {
    visibleItems,
    handlePhotoOverlayCreate
  };
};
