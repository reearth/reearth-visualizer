import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePropertyMutations } from "./usePropertyMutations";

// useMutation is stubbed once per mutation the hook creates, so this single
// mock stands in for whichever one the test at hand exercises.
const mutate = vi.fn();

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [mutate]
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useT: () => (s: string) => s,
  useLang: () => "ja"
}));

vi.mock("@reearth/services/state", () => ({
  useNotification: () => [undefined, vi.fn()]
}));

describe("usePropertyMutations.addPropertyItem", () => {
  beforeEach(() => {
    mutate.mockReset();
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

    expect(mutate).not.toHaveBeenCalled();
    expect(res.status).toBe("error");
  });

  it("sends all fields when every value type maps to a GraphQL type", async () => {
    mutate.mockResolvedValue({
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

    expect(mutate).toHaveBeenCalledWith(
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

describe("usePropertyMutations language", () => {
  beforeEach(() => {
    mutate.mockReset();
    mutate.mockResolvedValue({
      data: {
        addPropertyItem: {
          property: { id: "property-id" },
          propertyItem: { __typename: "PropertyGroup", id: "new-item-id" }
        },
        removePropertyItem: { property: { id: "property-id" } },
        movePropertyItem: { property: { id: "property-id" } }
      }
    });
  });

  // These three take no language from their callers. Without one the variable
  // went out undefined, so `translatedTitle(lang: null)` was written where
  // GetScene reads `translatedTitle(lang: "ja")` -- and because
  // PropertySchemaGroup has no id it is cached inline, so the write replaced
  // the array wholesale and discarded the cached translations.
  it("sends the current language for the mutations that take none", async () => {
    const { result } = renderHook(() => usePropertyMutations());

    await act(async () => {
      await result.current.addPropertyItem("property-id", "tiles");
      await result.current.removePropertyItem("property-id", "tiles", "item-id");
      await result.current.movePropertyItem("property-id", "tiles", "item-id", 0);
    });

    expect(mutate).toHaveBeenCalledTimes(3);
    for (const call of mutate.mock.calls) {
      expect(call[0].variables).toMatchObject({ lang: "ja" });
    }
  });

  it("forwards the language updatePropertyValue is given", async () => {
    mutate.mockResolvedValue({
      data: { updatePropertyValue: { property: { id: "property-id" } } }
    });
    const { result } = renderHook(() => usePropertyMutations());

    await act(async () => {
      await result.current.updatePropertyValue(
        "property-id",
        "tiles",
        "item-id",
        "tile_type",
        "ja",
        "google_satellite",
        "string"
      );
    });

    expect(mutate.mock.calls[0][0].variables).toMatchObject({ lang: "ja" });
  });
});
