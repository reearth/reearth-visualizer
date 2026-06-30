import { usePropertyMutations } from "@reearth/services/api/property";
import { useScene } from "@reearth/services/api/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useCallback } from "react";

const TILES_GROUP = "tiles";
const SYSTEM_TILE_CATEGORY = "system";

export const useSystemTile = (sceneId?: string) => {
  const { scene } = useScene({ sceneId });
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
