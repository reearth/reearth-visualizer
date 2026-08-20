import { SYSTEM_TILE_CATEGORY } from "@reearth/app/utils/convert-object";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useScene } from "@reearth/services/api/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useCallback, useRef } from "react";

const TILES_GROUP = "tiles";

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

  const createSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    if (!propertyId || getSystemTileItemId()) return;

    // Creating the tile takes three writes, but only the last one needs to
    // refresh the scene: a `GetScene` refetch per write means ~3 round trips
    // of the heaviest query in the app for a single widget install (SCA-06).
    const result = await addPropertyItem(propertyId, TILES_GROUP, {
      skipRefetch: true
    });
    if (result.status !== "success" || !result.data?.newItemId) return;

    const { newItemId } = result.data;

    const tileTypeResult = await updatePropertyValue(
      propertyId,
      TILES_GROUP,
      newItemId,
      "tile_type",
      lang,
      "google_satellite",
      "string",
      { skipRefetch: true, silentSuccess: true }
    );

    if (tileTypeResult?.status !== "success") {
      await removePropertyItem(propertyId, TILES_GROUP, newItemId);
      return;
    }

    // Last write of the chain, so it keeps the refetch that brings every
    // `GetScene` consumer up to date with the finished tile.
    const tileCategoryResult = await updatePropertyValue(
      propertyId,
      TILES_GROUP,
      newItemId,
      "tile_category",
      lang,
      SYSTEM_TILE_CATEGORY,
      "string",
      { silentSuccess: true }
    );

    if (tileCategoryResult?.status !== "success") {
      await removePropertyItem(propertyId, TILES_GROUP, newItemId);
      return;
    }
  }, [
    scene?.property?.id,
    getSystemTileItemId,
    addPropertyItem,
    updatePropertyValue,
    removePropertyItem,
    lang
  ]);

  // The scene query the existence check above reads from only settles once the
  // writes complete, so two calls fired in the same tick would both pass the
  // check and create duplicate tiles. Serialising on the in-flight creation
  // closes that window without spending a `GetScene` refetch on the check.
  const creating = useRef<Promise<void> | undefined>(undefined);

  const addSystemTile = useCallback(async () => {
    if (creating.current) {
      // A creation is already under way; it covers this caller too.
      await creating.current;
      return;
    }

    const run = createSystemTile();
    // Waiters must not inherit a rejection they cannot act on.
    creating.current = run.catch(() => undefined);
    try {
      await run;
    } finally {
      creating.current = undefined;
    }
  }, [createSystemTile]);

  const removeSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    const systemItemId = getSystemTileItemId();
    if (!propertyId || !systemItemId) return;
    await removePropertyItem(propertyId, TILES_GROUP, systemItemId);
  }, [scene?.property?.id, getSystemTileItemId, removePropertyItem]);

  return { getSystemTileItemId, addSystemTile, removeSystemTile };
};
