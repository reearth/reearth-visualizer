import { SYSTEM_TILE_CATEGORY } from "@reearth/app/utils/convert-object";
import { usePropertyMutations } from "@reearth/services/api/property";
import { useScene } from "@reearth/services/api/scene";
import { useCallback, useRef } from "react";

const TILES_GROUP = "tiles";

export const useSystemTile = (sceneId?: string) => {
  const { scene } = useScene({ sceneId });
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

  const createSystemTile = useCallback(async () => {
    const propertyId = scene?.property?.id;
    if (!propertyId || getSystemTileItemId()) return;

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
  }, [scene?.property?.id, getSystemTileItemId, addPropertyItem]);

  // The write is atomic but not unique: two calls landing in the same tick
  // would still create two tiles. The existence check above reads the watched
  // scene query, which only settles once the write completes, so serialising
  // on the in-flight creation is what closes that window -- and it does so
  // without spending a full GetScene refetch on the check.
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
