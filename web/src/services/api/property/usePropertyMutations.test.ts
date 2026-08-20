import {
  ADD_PROPERTY_ITEM,
  MOVE_PROPERTY_ITEM,
  REMOVE_PROPERTY_ITEM,
  UPDATE_PROPERTY_VALUE
} from "@reearth/services/gql/queries/property";
import { renderHook } from "@testing-library/react";
import { print } from "graphql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePropertyMutations } from "./usePropertyMutations";

const calls: { variables?: Record<string, unknown> }[] = [];

vi.mock("@apollo/client/react", () => ({
  useMutation: () => [
    vi.fn(async (options: { variables?: Record<string, unknown> }) => {
      calls.push(options);
      return {
        data: {
          updatePropertyValue: { property: { id: "property-id" } },
          addPropertyItem: {
            property: { id: "property-id" },
            propertyItem: { __typename: "PropertyGroup", id: "item-id" }
          },
          removePropertyItem: { property: { id: "property-id" } },
          movePropertyItem: { property: { id: "property-id" } }
        }
      };
    })
  ]
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useT: () => (key: string) => key,
  useLang: () => "ja"
}));

vi.mock("@reearth/services/state", () => ({
  useNotification: () => [null, vi.fn()]
}));

const DOCUMENTS = {
  UPDATE_PROPERTY_VALUE,
  ADD_PROPERTY_ITEM,
  REMOVE_PROPERTY_ITEM,
  MOVE_PROPERTY_ITEM
};

describe("usePropertyMutations", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  // Every one of these documents keys its schema fields on `$lang`
  // (`translatedTitle(lang: $lang)`). PropertySchemaGroup has no id, so it is
  // cached inline and a write replaces the array wholesale — sending a
  // different lang than GetScene read with discards its translations.
  it.each(Object.entries(DOCUMENTS))("%s declares $lang", (_name, document) => {
    expect(print(document)).toContain("$lang: Lang");
  });

  it("forwards the language it is given for updatePropertyValue", async () => {
    const { result } = renderHook(() => usePropertyMutations());

    await result.current.updatePropertyValue(
      "property-id",
      "tiles",
      "item-id",
      "tile_type",
      "ja",
      "google_satellite",
      "string"
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].variables).toMatchObject({ lang: "ja" });
  });

  // These three take no language from their callers, so without this the
  // variable went out undefined and the response landed under a different
  // cache key than the one GetScene reads.
  it("uses the current language for the mutations that take none", async () => {
    const { result } = renderHook(() => usePropertyMutations());

    await result.current.addPropertyItem("property-id", "tiles");
    await result.current.removePropertyItem("property-id", "tiles", "item-id");
    await result.current.movePropertyItem("property-id", "tiles", "item-id", 0);

    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.variables).toMatchObject({ lang: "ja" });
    }
  });

});
