import { filterVisibleItems } from "@reearth/app/ui/fields/utils";
import { usePhotoOverlayMutations } from "@reearth/services/api/photoOverlay";
import type { Item } from "@reearth/services/api/property";
import { convert } from "@reearth/services/api/property/utils";
import type { PropertyFragmentFragment } from "@reearth/services/gql";
import { useCallback, useMemo } from "react";

export default ({
  layerId,
  property
}: {
  layerId: string;
  property?: PropertyFragmentFragment | null;
}) => {
  const { createNLSPhotoOverlay } = usePhotoOverlayMutations();

  const visibleItems: Item[] | undefined = useMemo(
    () => filterVisibleItems(convert(property)),
    [property]
  );

  const handlePhotoOverlayCreate = useCallback(async () => {
    if (!property) {
      await createNLSPhotoOverlay({ layerId });
    }
  }, [layerId, property, createNLSPhotoOverlay]);

  return {
    visibleItems,
    handlePhotoOverlayCreate
  };
};
