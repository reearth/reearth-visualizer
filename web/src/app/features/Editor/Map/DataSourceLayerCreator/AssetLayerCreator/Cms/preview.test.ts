import { describe, expect, test } from "vitest";

import {
  MAX_PREVIEW_BYTES,
  cellText,
  csvReader,
  csvTable,
  czmlFeatures,
  geojsonFeatures,
  itemsTable,
  kmlFeatures,
  quickPreview,
  readBody,
  summarize
} from "./preview";

const asset = (url: string, extra = {}) => ({ url, size: 100, ...extra });

describe("quickPreview", () => {
  test("models are always loaded", () => {
    expect(quickPreview(asset("m.geojson"), true)).toBeUndefined();
  });

  test("private assets aren't loaded", () => {
    expect(quickPreview(asset("a.geojson", { private: true }), false)).toEqual({
      type: "private"
    });
  });

  test("formats without a preview", () => {
    expect(quickPreview(asset("a", { format: "3dtiles" }), false)).toEqual({
      type: "unsupported"
    });
    expect(quickPreview(asset("a.kmz"), false)).toEqual({
      type: "unsupported"
    });
  });

  test("files over the limit, except CSV", () => {
    const size = MAX_PREVIEW_BYTES + 1;
    expect(quickPreview(asset("a.geojson", { size }), false)).toEqual({
      type: "tooLarge"
    });
    expect(quickPreview(asset("a.csv", { size }), false)).toBeUndefined();
  });
});

describe("csvTable", () => {
  test("the first rows, and whether there are coordinate columns", () => {
    expect(
      csvTable([
        ["name", "lat", "lng"],
        ["Tokyo", "35.681", "139.767"]
      ])
    ).toEqual({
      type: "table",
      columns: ["name", "lat", "lng"],
      rows: [["Tokyo", "35.681", "139.767"]],
      hasLatLng: true
    });
    expect(csvTable([["name", "ward"]])).toMatchObject({ hasLatLng: false });
  });

  test("quoted fields, and records across pieces of text", () => {
    const read = csvReader();
    read('a,"b, c","say ""h');
    expect(read('i"""\r\n\r\nname,"north\r\nsouth"\n')).toEqual([
      ["a", "b, c", 'say "hi"'],
      ["name", "north\r\nsouth"]
    ]);
  });

  test("a record is complete only at its newline", () => {
    const read = csvReader();
    expect(read("a,b\nc,d")).toEqual([["a", "b"]]);
    expect(read("\n")).toEqual([
      ["a", "b"],
      ["c", "d"]
    ]);
  });
});

describe("itemsTable", () => {
  test("the fields a cell can show, leaving out metadata", () => {
    expect(
      itemsTable([
        {
          id: "1",
          $createdAt: "2024-03-02T00:00:00Z",
          name: "Ueno Park",
          area_m2: 538500,
          category: { id: "t1", name: "city" },
          location: { type: "Point", coordinates: [139.7, 35.7] }
        },
        { id: "2", name: "Yoyogi Park", category: { id: "t2", name: "metro" } }
      ])
    ).toEqual({
      type: "table",
      columns: ["name", "area_m2", "category"],
      rows: [
        ["Ueno Park", "538,500", "city"],
        ["Yoyogi Park", "", "metro"]
      ]
    });
  });

  test("formats values", () => {
    expect(cellText("2024-03-02T00:00:00Z")).toBe("2024-03-02");
    expect(cellText(["a", "b"])).toBe("a, b");
    expect(cellText({ name: "city" })).toBe("city");
    expect(cellText({ type: "Point" })).toBeUndefined();
    expect(cellText(null)).toBe("");
  });
});

describe("features", () => {
  test("GeoJSON shapes and properties", () => {
    const preview = summarize(
      geojsonFeatures({
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 0]
                ]
              ]
            },
            properties: { name: "a", ward: "b" }
          },
          {
            geometry: { type: "Polygon", coordinates: [[[2, 2]]] },
            properties: { area_m2: 1 }
          }
        ]
      })
    );
    expect(preview).toMatchObject({
      type: "features",
      count: 2,
      geometryType: "Polygon",
      properties: ["name", "ward", "area_m2"]
    });
    expect(preview.type === "features" && preview.shapes).toHaveLength(2);
  });

  test("KML placemarks", () => {
    const features = kmlFeatures(`<kml><Document><Placemark>
      <ExtendedData><Data name="name"/></ExtendedData>
      <Point><coordinates>139.7,35.6,0</coordinates></Point>
    </Placemark></Document></kml>`);
    expect(features).toEqual([
      {
        geometry: { type: "Point", coordinates: [139.7, 35.6] },
        properties: { name: "name" }
      }
    ]);
  });

  test("CZML packets, skipping the document", () => {
    const features = czmlFeatures([
      { id: "document" },
      { id: "a", position: { cartographicDegrees: [139.7, 35.6, 0] } }
    ]);
    expect(features).toEqual([
      {
        geometry: { type: "Point", coordinates: [139.7, 35.6] },
        properties: undefined
      }
    ]);
  });
});

describe("readBody", () => {
  test("stops and cancels a download once it's over the limit", async () => {
    const chunk = new Uint8Array(1024 * 1024);
    let pulled = 0;
    let cancelled = false;
    // Endless, as if the size were unknown.
    const reader = {
      read: async () => {
        pulled++;
        return { done: false, value: chunk };
      },
      cancel: async () => {
        cancelled = true;
      }
    };
    const res = { body: { getReader: () => reader } } as unknown as Response;
    expect(await readBody(res, () => false)).toBe(false);
    expect(cancelled).toBe(true);
    expect(pulled * chunk.length).toBeLessThan(MAX_PREVIEW_BYTES * 1.5);
  });

  test("reads a body within the limit", async () => {
    let text = "";
    const complete = await readBody(new Response("a,b\n1,2"), (piece) => {
      text += piece;
      return false;
    });
    expect(complete).toBe(true);
    expect(text).toBe("a,b\n1,2");
  });
});
