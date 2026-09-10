import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePropertyMutations } from "./usePropertyMutations";

const addPropertyItemMutation = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [addPropertyItemMutation]
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useT: () => (s: string) => s
}));

vi.mock("@reearth/services/state", () => ({
  useNotification: () => [undefined, vi.fn()]
}));

describe("usePropertyMutations.addPropertyItem", () => {
  beforeEach(() => {
    addPropertyItemMutation.mockReset();
  });

  it("does not call the mutation when a field's value type has no GraphQL mapping", async () => {
    const { result } = renderHook(() => usePropertyMutations());

    const res = await act(async () =>
      result.current.addPropertyItem("property-id", "tiles", [
        // "tiletype" is a real ValueType with no entry in valueTypeMapper, so
        // valueTypeToGQL("tiletype") returns undefined -- this must fail the
        // whole call instead of silently sending a partial field list.
        {
          fieldId: "tile_type",
          value: "google_satellite",
          valueType: "tiletype"
        }
      ])
    );

    expect(addPropertyItemMutation).not.toHaveBeenCalled();
    expect(res.status).toBe("error");
  });

  it("sends all fields when every value type maps to a GraphQL type", async () => {
    addPropertyItemMutation.mockResolvedValue({
      data: {
        addPropertyItem: {
          property: { id: "property-id" },
          propertyItem: { __typename: "PropertyGroup", id: "new-item-id" }
        }
      }
    });

    const { result } = renderHook(() => usePropertyMutations());

    await act(async () =>
      result.current.addPropertyItem("property-id", "tiles", [
        {
          fieldId: "tile_type",
          value: "google_satellite",
          valueType: "string"
        },
        { fieldId: "tile_category", value: "system", valueType: "string" }
      ])
    );

    expect(addPropertyItemMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          fields: [
            { fieldId: "tile_type", value: "google_satellite", type: "STRING" },
            { fieldId: "tile_category", value: "system", type: "STRING" }
          ]
        })
      })
    );
  });
});
