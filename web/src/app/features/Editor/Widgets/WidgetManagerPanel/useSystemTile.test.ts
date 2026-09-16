import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSystemTile } from "./useSystemTile";

const addPropertyItem = vi.fn();
const removePropertyItem = vi.fn();

type Scene = {
  property?: {
    id: string;
    items: {
      __typename: string;
      schemaGroupId: string;
      groups: { id: string; fields: { fieldId: string; value: unknown }[] }[];
    }[];
  };
};

const withSystemTile: Scene = {
  property: {
    id: "property-id",
    items: [
      {
        __typename: "PropertyGroupList",
        schemaGroupId: "tiles",
        groups: [
          {
            id: "system-tile-id",
            fields: [{ fieldId: "tile_category", value: "system" }]
          }
        ]
      }
    ]
  }
};

let scene: Scene = { property: { id: "property-id", items: [] } };

vi.mock("@reearth/services/api/property", () => ({
  usePropertyMutations: () => ({ addPropertyItem, removePropertyItem })
}));

vi.mock("@reearth/services/api/scene", () => ({
  useScene: () => ({
    get scene() {
      return scene;
    }
  })
}));

describe("useSystemTile", () => {
  beforeEach(() => {
    addPropertyItem.mockReset();
    addPropertyItem.mockResolvedValue({ status: "success" });
    removePropertyItem.mockReset();
    scene = { property: { id: "property-id", items: [] } };
  });

  it("creates the tile with tile_type and tile_category in a single addPropertyItem call (REL-07)", async () => {
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    expect(addPropertyItem).toHaveBeenCalledTimes(1);
    expect(addPropertyItem).toHaveBeenCalledWith("property-id", "tiles", [
      { fieldId: "tile_type", value: "google_satellite", valueType: "string" },
      { fieldId: "tile_category", value: "system", valueType: "string" }
    ]);
  });

  it("does not create a tile when a system tile already exists", async () => {
    scene = withSystemTile;
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    expect(addPropertyItem).not.toHaveBeenCalled();
  });

  // The existence check reads the watched scene query, which only settles once
  // the write completes, so concurrent callers would otherwise both pass it.
  it("creates a single tile when called concurrently (SCA-06)", async () => {
    let release: (() => void) | undefined;
    addPropertyItem.mockImplementation(
      async () =>
        new Promise((resolve) => {
          release = () => resolve({ status: "success" });
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

  it("removes the tagged system tile item", async () => {
    scene = withSystemTile;
    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.removeSystemTile();
    });

    expect(removePropertyItem).toHaveBeenCalledWith(
      "property-id",
      "tiles",
      "system-tile-id"
    );
  });
});
