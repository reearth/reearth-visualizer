import { describe, expect, it } from "vitest";

import { computeHasCesiumIonAsset } from "./cesiumIonDetection";

const makeSimpleLayer = (data: Record<string, unknown>) => ({
  id: "test",
  type: "simple" as const,
  data,
});

const makeGroupLayer = (children: unknown[]) => ({
  id: "group",
  type: "group" as const,
  children,
});

describe("computeHasCesiumIonAsset", () => {
  describe("tiles", () => {
    it("returns false when no tiles", () => {
      expect(computeHasCesiumIonAsset({})).toBe(false);
    });

    it("returns true for cesium_ion tile type", () => {
      expect(
        computeHasCesiumIonAsset({ tiles: [{ id: "1", type: "cesium_ion" }] }),
      ).toBe(true);
    });

    it("returns true for cesium_ion_default tile type", () => {
      expect(
        computeHasCesiumIonAsset({ tiles: [{ id: "1", type: "cesium_ion_default" }] }),
      ).toBe(true);
    });

    it("returns true for legacy alias tile types", () => {
      for (const type of ["default", "default_road", "default_label", "black_marble"]) {
        expect(
          computeHasCesiumIonAsset({ tiles: [{ id: "1", type }] }),
        ).toBe(true);
      }
    });

    it("returns false for open_street_map tile", () => {
      expect(
        computeHasCesiumIonAsset({ tiles: [{ id: "1", type: "open_street_map" }] }),
      ).toBe(false);
    });

    it("returns false for url tile type", () => {
      expect(
        computeHasCesiumIonAsset({ tiles: [{ id: "1", type: "url", url: "https://example.com/{z}/{x}/{y}.png" }] }),
      ).toBe(false);
    });
  });

  describe("terrain", () => {
    it("returns false when terrain is disabled", () => {
      expect(
        computeHasCesiumIonAsset({ terrain: { enabled: false, type: "cesium" } }),
      ).toBe(false);
    });

    it("returns true for cesium terrain type when enabled", () => {
      expect(
        computeHasCesiumIonAsset({ terrain: { enabled: true, type: "cesium" } }),
      ).toBe(true);
    });

    it("returns true for cesiumion terrain type when enabled", () => {
      expect(
        computeHasCesiumIonAsset({ terrain: { enabled: true, type: "cesiumion" } }),
      ).toBe(true);
    });

    it("returns false for reearth_terrain", () => {
      expect(
        computeHasCesiumIonAsset({ terrain: { enabled: true, type: "reearth_terrain" } }),
      ).toBe(false);
    });

    it("returns true for ionUrl containing ion.cesium.com", () => {
      expect(
        computeHasCesiumIonAsset({
          terrain: { enabled: true, type: "cesiumion" },
          assets: { cesium: { terrain: { ionUrl: "https://assets.ion.cesium.com/1/layer.json" } } } as any,
        }),
      ).toBe(true);
    });
  });

  describe("layers", () => {
    it("returns true for osm-buildings layer", () => {
      expect(
        computeHasCesiumIonAsset({}, [makeSimpleLayer({ type: "osm-buildings" }) as any]),
      ).toBe(true);
    });

    it("returns false for reearth-buildings layer (migrated from osm-buildings without token)", () => {
      expect(
        computeHasCesiumIonAsset({}, [makeSimpleLayer({ type: "reearth-buildings" }) as any]),
      ).toBe(false);
    });

    it("returns true for google-photorealistic without provider (routed through Ion)", () => {
      expect(
        computeHasCesiumIonAsset({}, [makeSimpleLayer({ type: "google-photorealistic" }) as any]),
      ).toBe(true);
    });

    it("returns true for google-photorealistic with provider=cesium-ion", () => {
      expect(
        computeHasCesiumIonAsset({}, [
          makeSimpleLayer({ type: "google-photorealistic", provider: "cesium-ion" }) as any,
        ]),
      ).toBe(true);
    });

    it("returns false for google-photorealistic with provider=reearth", () => {
      expect(
        computeHasCesiumIonAsset({}, [
          makeSimpleLayer({ type: "google-photorealistic", provider: "reearth" }) as any,
        ]),
      ).toBe(false);
    });

    it("returns false for google-photorealistic with googleMapApiKey and non-cesium-ion provider", () => {
      expect(
        computeHasCesiumIonAsset({}, [
          makeSimpleLayer({
            type: "google-photorealistic",
            serviceTokens: { googleMapApiKey: "key" },
            provider: "google",
          }) as any,
        ]),
      ).toBe(false);
    });

    it("returns true for 3dtiles with ion.cesium.com URL", () => {
      expect(
        computeHasCesiumIonAsset({}, [
          makeSimpleLayer({ type: "3dtiles", url: "https://assets.ion.cesium.com/96188/tileset.json" }) as any,
        ]),
      ).toBe(true);
    });

    it("returns false for 3dtiles with non-Ion URL", () => {
      expect(
        computeHasCesiumIonAsset({}, [
          makeSimpleLayer({ type: "3dtiles", url: "https://example.com/tileset.json" }) as any,
        ]),
      ).toBe(false);
    });

    it("returns false for unrelated layer types", () => {
      expect(
        computeHasCesiumIonAsset({}, [makeSimpleLayer({ type: "geojson" }) as any]),
      ).toBe(false);
    });
  });

  describe("nested group layers", () => {
    it("returns true when Ion layer is nested inside a group", () => {
      const group = makeGroupLayer([makeSimpleLayer({ type: "osm-buildings" })]);
      expect(computeHasCesiumIonAsset({}, [group as any])).toBe(true);
    });

    it("returns true for deeply nested Ion layer", () => {
      const inner = makeGroupLayer([makeSimpleLayer({ type: "osm-buildings" })]);
      const outer = makeGroupLayer([inner]);
      expect(computeHasCesiumIonAsset({}, [outer as any])).toBe(true);
    });

    it("returns false when group contains only non-Ion layers", () => {
      const group = makeGroupLayer([makeSimpleLayer({ type: "geojson" })]);
      expect(computeHasCesiumIonAsset({}, [group as any])).toBe(false);
    });

    it("returns false for empty group", () => {
      const group = makeGroupLayer([]);
      expect(computeHasCesiumIonAsset({}, [group as any])).toBe(false);
    });
  });

  describe("combined", () => {
    it("returns false when nothing uses Ion", () => {
      expect(
        computeHasCesiumIonAsset(
          { tiles: [{ id: "1", type: "open_street_map" }], terrain: { enabled: true, type: "reearth_terrain" } },
          [makeSimpleLayer({ type: "geojson" }) as any],
        ),
      ).toBe(false);
    });

    it("returns true when only tiles use Ion", () => {
      expect(
        computeHasCesiumIonAsset(
          { tiles: [{ id: "1", type: "cesium_ion_default" }], terrain: { enabled: true, type: "reearth_terrain" } },
          [makeSimpleLayer({ type: "geojson" }) as any],
        ),
      ).toBe(true);
    });
  });
});
