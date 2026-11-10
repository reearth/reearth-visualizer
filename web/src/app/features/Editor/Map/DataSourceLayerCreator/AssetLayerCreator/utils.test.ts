import { afterEach, describe, expect, it, vi } from "vitest";

import { checkModelGeoJson, cmsAssetLayer, formatOf } from "./utils";

// A stand-in for what checkModelGeoJson reads of a Response: a real one
// fails in CI, where jsdom's ReadableStream isn't the one undici expects.
const respond = (status: number, body = "") =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      body: null,
      text: async () => body
    })
  );

const check = () =>
  checkModelGeoJson(
    "https://cms.example.com/api/p/ws/proj/model.geojson",
    new AbortController().signal
  );

describe("checkModelGeoJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes a model served as GeoJSON, fetching a single item", async () => {
    respond(200, '{"type":"FeatureCollection","features":[]}');
    expect(await check()).toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(
      "https://cms.example.com/api/p/ws/proj/model.geojson?limit=1",
      expect.anything()
    );
  });

  it("reports a model without a geometry field", async () => {
    respond(500, '{"message":"no geometry field in this model"}');
    expect(await check()).toBe("noGeometry");
  });

  it("reports a model not published to the Public API", async () => {
    respond(404, '{"error":"not found"}');
    expect(await check()).toBe("unavailable");
  });

  it("stops when aborted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, { signal }: { signal: AbortSignal }) =>
          new Promise((_, reject) =>
            signal.addEventListener("abort", () => reject(signal.reason))
          )
      )
    );
    const controller = new AbortController();
    const result = checkModelGeoJson(
      "https://cms.example.com/m",
      controller.signal
    );
    controller.abort();
    expect(await result).toBe("unavailable");
  });

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed")));
    expect(await check()).toBe("unavailable");
  });
});

describe("cmsAssetLayer", () => {
  const base = "https://assets.cms.example.com/assets/ab/cdef/tiles";

  it("serves an extracted MVT archive as a tile template", () => {
    expect(
      cmsAssetLayer({
        url: `${base}.zip`,
        previewType: "geo_mvt",
        archiveExtractionStatus: "done"
      })
    ).toEqual({ url: `${base}/{z}/{x}/{y}.mvt`, format: "mvt" });
  });

  it("turns a single MVT tile's URL into a template", () => {
    expect(
      cmsAssetLayer({ url: `${base}/12/3639/1612.mvt`, previewType: "GEO_MVT" })
    ).toEqual({ url: `${base}/{z}/{x}/{y}.mvt`, format: "mvt" });
  });

  it("treats a .mvt or .pbf file as MVT without the preview type", () => {
    expect(cmsAssetLayer({ url: `${base}/12/3639/1612.pbf` })).toEqual({
      url: `${base}/{z}/{x}/{y}.mvt`,
      format: "mvt"
    });
    expect(
      cmsAssetLayer({ url: `${base}/roads.mvt`, previewType: "unknown" })
    ).toEqual({ url: `${base}/{z}/{x}/{y}.mvt`, format: "mvt" });
  });

  it("matches the path, keeping a query such as a token", () => {
    expect(cmsAssetLayer({ url: `${base}/12/3639/1612.pbf?token=a` })).toEqual({
      url: `${base}/{z}/{x}/{y}.mvt?token=a`,
      format: "mvt"
    });
    expect(
      cmsAssetLayer({
        url: `${base}.zip?token=a`,
        previewType: "geo_3d_tiles",
        archiveExtractionStatus: "done"
      })
    ).toEqual({ url: `${base}/tileset.json?token=a`, format: "3dtiles" });
  });

  it("leaves out an MVT archive that isn't extracted yet", () => {
    expect(
      cmsAssetLayer({
        url: `${base}.zip`,
        previewType: "geo_mvt",
        archiveExtractionStatus: "in_progress"
      })
    ).toEqual({ url: `${base}.zip` });
  });

  it("recognises a WMS endpoint from its URL", () => {
    expect(
      cmsAssetLayer({ url: "https://maps.example.com/geoserver/wms" })
    ).toEqual({ url: "https://maps.example.com/geoserver/wms", format: "wms" });
    const cgi = "https://maps.example.com/cgi-bin/tokyo_wms.cgi";
    expect(cmsAssetLayer({ url: cgi })).toEqual({ url: cgi, format: "wms" });
    const getMap =
      "https://maps.example.com/ows?service=WMS&request=GetMap&LAYERS=roads";
    expect(cmsAssetLayer({ url: getMap })).toEqual({
      url: getMap,
      format: "wms"
    });
  });

  it("serves CMS 3D Tiles from their tileset entry point", () => {
    expect(
      cmsAssetLayer({
        url: `${base}/tileset.json`,
        previewType: "geo_3d_tiles"
      })
    ).toEqual({ url: `${base}/tileset.json`, format: "3dtiles" });
    expect(
      cmsAssetLayer({
        url: `${base}.zip`,
        previewType: "geo_3d_tiles",
        archiveExtractionStatus: "done"
      })
    ).toEqual({ url: `${base}/tileset.json`, format: "3dtiles" });
    expect(
      cmsAssetLayer({
        url: `${base}.zip`,
        previewType: "geo_3d_tiles",
        archiveExtractionStatus: "pending"
      })
    ).toEqual({ url: `${base}.zip` });
  });

  it("leaves other assets to their extension", () => {
    expect(
      cmsAssetLayer({ url: `${base}.geojson`, previewType: "geo" })
    ).toEqual({ url: `${base}.geojson` });
  });
});

describe("formatOf", () => {
  it("reads the extension from the path, not the query or fragment", () => {
    expect(formatOf("https://example.com/roads.geojson?token=a.b")).toBe(
      "geojson"
    );
    expect(formatOf("https://example.com/points.csv#top")).toBe("csv");
    expect(formatOf("https://example.com/data?file=x.kml")).toBeUndefined();
  });
});
