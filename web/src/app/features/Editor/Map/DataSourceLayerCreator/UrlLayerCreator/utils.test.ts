import { describe, expect, it } from "vitest";

import { inferFormat, isWmsUrl } from "./utils";

describe("isWmsUrl", () => {
  it.each([
    "https://maps.example.com/geoserver/wms",
    "https://maps.example.com/geoserver/wms/",
    "https://maps.example.com/cgi-bin/wms.cgi",
    "https://maps.example.com/cgi-bin/tokyo_wms.cgi?LAYERS=roads",
    "https://maps.example.com/ows?service=WMS&request=GetCapabilities",
    "https://maps.example.com/ows?SERVICE=wms"
  ])("recognises %s", (url) => {
    expect(isWmsUrl(url)).toBe(true);
  });

  it.each([
    "https://example.com/data/roads.geojson",
    "https://example.com/wms/roads.geojson",
    "https://example.com/ows?service=WFS",
    "not a url"
  ])("rejects %s", (url) => {
    expect(isWmsUrl(url)).toBe(false);
  });
});

describe("inferFormat", () => {
  it("picks WMS for a wms.cgi endpoint", () => {
    expect(inferFormat("https://maps.example.com/cgi-bin/wms.cgi")).toBe("wms");
  });

  it("still goes by the extension otherwise", () => {
    expect(inferFormat("https://example.com/data/roads.geojson")).toBe(
      "geojson"
    );
  });
});
