import { SYSTEM_TILE_CATEGORY } from "@reearth/app/utils/convert-object";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useScene } from "@reearth/services/api/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useCallback } from "react";

const TILES_GROUP = "tiles";

export const useSystemTile = (sceneId?: string) => {
  const { scene, refetch } = useScene({ sceneId });
  const { addPropertyItem, updatePropertyValue, removePropertyItem } = usePropertyMutations();
  const lang = useLang();

  const getSystemTileItemId = useCallback((): string | undefined => {
    const tilesGroupList = scene?.property?.items.find(
      (item) => item.__typename === "PropertyGroupList" && item.schemaGroupId === TILES_GROUP
    );
    if (tilesGroupList?.__typename !== "PropertyGroupList") return undefined;

    return tilesGroupList.groups.find((group) =>
      group.fields.some((f) => f.fieldId === "tile_category" && f.value === SYSTEM_TILE_CATEGORY)
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
        (item) => item.__typename === "PropertyGroupList" && item.schemaGroupId === TILES_GROUP
      );
      const alreadyExists =
        freshTilesGroup?.__typename === "PropertyGroupList" &&
        freshTilesGroup.groups.some((group) =>
          group.fields.some(
            (f) => f.fieldId === "tile_category" && f.value === SYSTEM_TILE_CATEGORY
          )
        );
      if (alreadyExists) return;
    }

    const result = await addPropertyItem(propertyId, TILES_GROUP);
    if (result.status !== "success" || !result.data?.newItemId) return;

    const { newItemId } = result.data;

    const tileTypeResult = await updatePropertyValue(
      propertyId,
      TILES_GROUP,
      newItemId,
      "tile_type",
      lang,
      "google_satellite",
      "string"
    );

    if (tileTypeResult?.status !== "success") {
      await removePropertyItem(propertyId, TILES_GROUP, newItemId);
      return;
    }

    const tileCategoryResult = await updatePropertyValue(
      propertyId,
      TILES_GROUP,
      newItemId,
      "tile_category",
      lang,
      SYSTEM_TILE_CATEGORY,
      "string"
    );

    if (tileCategoryResult?.status !== "success") {
      await removePropertyItem(propertyId, TILES_GROUP, newItemId);
      return;
    }
  }, [
    scene?.property?.id,
    refetch,
    addPropertyItem,
    updatePropertyValue,
    removePropertyItem,
    lang
  ]);
  const removeSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    const systemItemId = getSystemTileItemId();
    if (!propertyId || !systemItemId) return;
    await removePropertyItem(propertyId, TILES_GROUP, systemItemId);
  }, [scene?.property?.id, getSystemTileItemId, removePropertyItem]);

  return { getSystemTileItemId, addSystemTile, removeSystemTile };
};
