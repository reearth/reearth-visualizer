import { expect, test } from "vitest";

import { convertLayer, getCompat } from "./backward";
import type { Infobox, Tag } from "./types";

const infobox: Infobox = { blocks: [], property: { default: { bgcolor: "red" } } };
const tags: Tag[] = [{ id: "x", label: "x" }];

test("group", () => {
  expect(
    convertLayer({
      id: "xxx",
      type: "group",
      children: [
        {
          id: "yyy",
          type: "group",
          children: [],
        },
      ],
      visible: true,
      compat: {
        property: { a: 1 },
        propertyId: "p",
        extensionId: "hoge",
      },
      title: "title",
      creator: "creator",
      infobox,
      tags,
    }),
  ).toEqual({
    id: "xxx",
    children: [
      {
        id: "yyy",
        children: [],
      },
    ],
    title: "title",
    isVisible: true,
    creator: "creator",
    infobox,
    tags,
    pluginId: "reearth",
    extensionId: "hoge",
    property: { a: 1 },
    propertyId: "p",
  });
});

test("item", () => {
  expect(
    convertLayer({
      id: "xxx",
      type: "simple",
      visible: true,
      compat: {
        property: { a: 1 },
        propertyId: "p",
        extensionId: "hoge",
      },
      title: "title",
      creator: "creator",
      infobox,
      tags,
    }),
  ).toEqual({
    id: "xxx",
    isVisible: true,
    title: "title",
    creator: "creator",
    infobox,
    tags,
    pluginId: "reearth",
    extensionId: "hoge",
    property: { a: 1 },
    propertyId: "p",
  });
});

test("getCompat", () => {
  expect(getCompat(undefined)).toBeUndefined();
  expect(getCompat({ type: "aaa" } as any)).toBeUndefined();
});

test("marker", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      marker: {
        pointColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    }),
  ).toEqual({
    extensionId: "marker",
    propertyId: "p",
    property: {
      default: {
        location: { lat: 2, lng: 1 },
        height: 3,
        pointColor: "red",
      },
    },
  });
});

test("polyline", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [1, 2, 3],
              [2, 3, 4],
            ],
          },
        },
      },
      polyline: {
        strokeColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "polyline",
    propertyId: "p",
    property: {
      default: {
        coordinates: [
          { lat: 2, lng: 1, height: 3 },
          { lat: 3, lng: 2, height: 4 },
        ],
        strokeColor: "red",
      },
    },
  });
});

test("polygon", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [1, 2, 3],
                [2, 3, 4],
              ],
            ],
          },
        },
      },
      polygon: {
        fillColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "polygon",
    propertyId: "p",
    property: {
      default: {
        polygon: [
          [
            { lat: 2, lng: 1, height: 3 },
            { lat: 3, lng: 2, height: 4 },
          ],
        ],
        fillColor: "red",
      },
    },
  });
});

test("photooverlay", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      photooverlay: {
        imageSize: 1,
      },
      compat: {
        propertyId: "p",
      },
    }),
  ).toEqual({
    extensionId: "photooverlay",
    propertyId: "p",
    property: {
      default: {
        location: { lat: 2, lng: 1 },
        height: 3,
        imageSize: 1,
      },
    },
  });
});

test("ellipsoid", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      ellipsoid: {
        radii: 100,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "ellipsoid",
    propertyId: "p",
    property: {
      default: {
        position: { lat: 2, lng: 1 },
        height: 3,
        radii: 100,
      },
    },
  });
});

test("model", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      model: {
        model: "xxx",
        color: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "model",
    propertyId: "p",
    property: {
      default: {
        location: { lat: 2, lng: 1 },
        height: 3,
        model: "xxx",
      },
      appearance: {
        color: "red",
      },
    },
  });
});

test("3dtiles", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "3dtiles",
        url: "xxx",
      },
      "3dtiles": {
        aaaa: 1,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "tileset",
    propertyId: "p",
    property: {
      default: {
        tileset: "xxx",
        aaaa: 1,
      },
    },
  });
});

test("resource", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      resource: {
        url: "xxx",
        aaaa: 1,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "resource",
    propertyId: "p",
    property: {
      default: {
        url: "xxx",
        aaaa: 1,
      },
    },
  });
});
