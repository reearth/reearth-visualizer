import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSystemTile } from "./useSystemTile";

const addPropertyItem = vi.fn();
const removePropertyItem = vi.fn();
const refetch = vi.fn();

let scene: {
  property?: {
    id: string;
    items: {
      __typename: string;
      schemaGroupId: string;
      groups: { id: string; fields: { fieldId: string; value: unknown }[] }[];
    }[];
  };
} = { property: { id: "property-id", items: [] } };

vi.mock("@reearth/services/api/property", () => ({
  usePropertyMutations: () => ({ addPropertyItem, removePropertyItem })
}));

vi.mock("@reearth/services/api/scene", () => ({
  useScene: () => ({
    get scene() {
      return scene;
    },
    refetch
  })
}));

describe("useSystemTile", () => {
  beforeEach(() => {
    addPropertyItem.mockReset();
    removePropertyItem.mockReset();
    refetch.mockReset();
    refetch.mockResolvedValue({ data: { node: undefined } });
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

  it("does not create a tile when a system tile already exists after refetch", async () => {
    refetch.mockResolvedValue({
      data: {
        node: {
          __typename: "Scene",
          property: {
            items: [
              {
                __typename: "PropertyGroupList",
                schemaGroupId: "tiles",
                groups: [
                  {
                    id: "existing-tile",
                    fields: [{ fieldId: "tile_category", value: "system" }]
                  }
                ]
              }
            ]
          }
        }
      }
    });

    const { result } = renderHook(() => useSystemTile("scene-id"));

    await act(async () => {
      await result.current.addSystemTile();
    });

    expect(addPropertyItem).not.toHaveBeenCalled();
  });

  it("removes the tagged system tile item", async () => {
    scene = {
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
