import { SYSTEM_TILE_CATEGORY } from "@reearth/app/utils/convert-object";
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSystemTile } from "./useSystemTile";

const addPropertyItem = vi.fn();
const updatePropertyValue = vi.fn();
const removePropertyItem = vi.fn();

const emptyTilesGroup = {
  __typename: "PropertyGroupList" as const,
  id: "tiles-group-list-id",
  schemaGroupId: "tiles",
  groups: []
};

const systemTileGroup = {
  id: "system-tile-item-id",
  fields: [{ fieldId: "tile_category", value: SYSTEM_TILE_CATEGORY }]
};

let scene: unknown = {
  property: { id: "property-id", items: [emptyTilesGroup] }
};

vi.mock("@reearth/services/api/property", () => ({
  usePropertyMutations: () => ({
    addPropertyItem,
    updatePropertyValue,
    removePropertyItem
  })
}));

vi.mock("@reearth/services/api/scene", () => ({
  useScene: () => ({
    get scene() {
      return scene;
    }
  })
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useLang: () => "en"
}));

const optionsOf = (call: unknown[]) => call[call.length - 1];

describe("useSystemTile", () => {
  beforeEach(() => {
    addPropertyItem.mockReset();
    updatePropertyValue.mockReset();
    removePropertyItem.mockReset();
    scene = { property: { id: "property-id", items: [emptyTilesGroup] } };

    addPropertyItem.mockResolvedValue({
      status: "success",
      data: { propertyId: "property-id", newItemId: "new-item-id" }
    });
    updatePropertyValue.mockResolvedValue({ status: "success" });
  });

  it("refetches GetScene only once for the whole chain (SCA-06)", async () => {
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    // Item creation and the first value write are intermediate steps.
    expect(optionsOf(addPropertyItem.mock.calls[0])).toMatchObject({
      skipRefetch: true
    });
    expect(optionsOf(updatePropertyValue.mock.calls[0])).toMatchObject({
      skipRefetch: true
    });

    // The last write is what brings every GetScene consumer up to date.
    expect(optionsOf(updatePropertyValue.mock.calls[1])).not.toMatchObject({
      skipRefetch: true
    });

    const refetching = [
      ...addPropertyItem.mock.calls,
      ...updatePropertyValue.mock.calls
    ].filter(
      (call) => !(optionsOf(call) as { skipRefetch?: boolean })?.skipRefetch
    );
    expect(refetching).toHaveLength(1);
  });

  it("does not notify success for the internal tile writes", async () => {
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    for (const call of updatePropertyValue.mock.calls) {
      expect(optionsOf(call)).toMatchObject({ silentSuccess: true });
    }
  });

  it("creates a single tile when called concurrently", async () => {
    let release: (() => void) | undefined;
    addPropertyItem.mockImplementation(
      async () =>
        new Promise((resolve) => {
          release = () =>
            resolve({
              status: "success",
              data: { propertyId: "property-id", newItemId: "new-item-id" }
            });
        })
    );

    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      const first = result.current.addSystemTile();
      const second = result.current.addSystemTile();
      await Promise.resolve();
      release?.();
      await Promise.all([first, second]);
    });

    expect(addPropertyItem).toHaveBeenCalledTimes(1);
  });

  it("does nothing when a system tile already exists", async () => {
    scene = {
      property: {
        id: "property-id",
        items: [{ ...emptyTilesGroup, groups: [systemTileGroup] }]
      }
    };
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    expect(addPropertyItem).not.toHaveBeenCalled();
  });

  it("rolls back the new item when a value write fails", async () => {
    updatePropertyValue.mockResolvedValueOnce({ status: "error" });
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    expect(removePropertyItem).toHaveBeenCalledWith(
      "property-id",
      "tiles",
      "new-item-id"
    );
  });
});
