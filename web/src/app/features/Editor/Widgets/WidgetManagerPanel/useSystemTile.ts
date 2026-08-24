import { SYSTEM_TILE_CATEGORY } from "@reearth/app/utils/convert-object";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useScene } from "@reearth/services/api/scene";
import { useCallback } from "react";

const TILES_GROUP = "tiles";

export const useSystemTile = (sceneId?: string) => {
  const { scene, refetch } = useScene({ sceneId });
  const { addPropertyItem, removePropertyItem } = usePropertyMutations();

  const getSystemTileItemId = useCallback((): string | undefined => {
    const tilesGroupList = scene?.property?.items.find(
      (item) =>
        item.__typename === "PropertyGroupList" &&
        item.schemaGroupId === TILES_GROUP
    );
    if (tilesGroupList?.__typename !== "PropertyGroupList") return undefined;

    return tilesGroupList.groups.find((group) =>
      group.fields.some(
        (f) => f.fieldId === "tile_category" && f.value === SYSTEM_TILE_CATEGORY
      )
    )?.id;
  }, [scene?.property]);

  const addSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    if (!propertyId) return;

    // Fetch fresh scene data so concurrent calls don't both pass the
    // stale-cache check and create duplicate system tiles.
    const freshResult = await refetch();
    const freshNode = freshResult.data?.node;
    if (freshNode?.__typename === "Scene") {
      const freshTilesGroup = freshNode.property?.items.find(
        (item) =>
          item.__typename === "PropertyGroupList" &&
          item.schemaGroupId === TILES_GROUP
      );
      const alreadyExists =
        freshTilesGroup?.__typename === "PropertyGroupList" &&
        freshTilesGroup.groups.some((group) =>
          group.fields.some(
            (f) =>
              f.fieldId === "tile_category" && f.value === SYSTEM_TILE_CATEGORY
          )
        );
      if (alreadyExists) return;
    }

    // tile_type and tile_category are set as part of the same
    // addPropertyItem call, in the same server-side transaction as the
    // item's creation, so there's no window where the item exists without
    // being tagged as a system tile -- a failure here means nothing was
    // created at all, with nothing left to roll back.
    await addPropertyItem(propertyId, TILES_GROUP, [
      { fieldId: "tile_type", value: "google_satellite", valueType: "string" },
      {
        fieldId: "tile_category",
        value: SYSTEM_TILE_CATEGORY,
        valueType: "string"
      }
    ]);
  }, [scene?.property?.id, refetch, addPropertyItem]);
  const removeSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    const systemItemId = getSystemTileItemId();
    if (!propertyId || !systemItemId) return;
    await removePropertyItem(propertyId, TILES_GROUP, systemItemId);
  }, [scene?.property?.id, getSystemTileItemId, removePropertyItem]);

  return { getSystemTileItemId, addSystemTile, removeSystemTile };
};
