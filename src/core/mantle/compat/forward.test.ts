import { expect, test } from "vitest";

import { convertLegacyLayer } from "./forward";
import type { Infobox, Tag } from "./types";

const infobox: Infobox = { blocks: [], property: { default: { bgcolor: "red" } } };
const tags: Tag[] = [{ id: "x", label: "x" }];

test("group", () => {
  expect(
    convertLegacyLayer({
      id: "xxx",
      isVisible: true,
      title: "title",
      creator: "aaa",
      infobox,
      tags,
      extensionId: "a",
      propertyId: "p",
      property: { a: 1 },
      children: [
        {
          id: "yyy",
          type: "group",
          children: [],
        },
      ],
    }),
  ).toEqual({
    id: "xxx",
    type: "group",
    title: "title",
    visible: true,
    compat: {
      property: { a: 1 },
      extensionId: "a",
      propertyId: "p",
    },
    infobox,
    tags,
    creator: "aaa",
    children: [
      {
        id: "yyy",
        type: "group",
        children: [],
      },
    ],
  });
});

test("marker", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "marker",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          pointColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    visible: true,
    marker: {
      pointColor: "red",
    },
    compat: {
      extensionId: "marker",
      propertyId: "p",
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          pointColor: "red",
        },
      },
    },
  });
});

test("polyline", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "polyline",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          coordinates: [
            { lat: 1, lng: 2, height: 3 },
            { lat: 2, lng: 3, height: 4 },
          ],
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 1, 3],
            [3, 2, 4],
          ],
        },
      },
    },
    visible: true,
    polyline: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "polyline",
      propertyId: "p",
      property: {
        default: {
          coordinates: [
            { lat: 1, lng: 2, height: 3 },
            { lat: 2, lng: 3, height: 4 },
          ],
          strokeColor: "red",
        },
      },
    },
  });
});

test("polygon", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "polygon",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          polygon: [
            [
              { lat: 1, lng: 2, height: 3 },
              { lat: 2, lng: 3, height: 4 },
            ],
          ],
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [2, 1, 3],
              [3, 2, 4],
            ],
          ],
        },
      },
    },
    visible: true,
    polygon: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "polygon",
      propertyId: "p",
      property: {
        default: {
          polygon: [
            [
              { lat: 1, lng: 2, height: 3 },
              { lat: 2, lng: 3, height: 4 },
            ],
          ],
          strokeColor: "red",
        },
      },
    },
  });
});

test("rect", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "rect",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          rect: {
            north: 1,
            east: 2,
            south: 3,
            west: 4,
          },
          height: 3,
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [4, 1, 3],
              [2, 1, 3],
              [2, 3, 3],
              [4, 3, 3],
              [4, 1, 3],
            ],
          ],
        },
      },
    },
    visible: true,
    polygon: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "rect",
      propertyId: "p",
      property: {
        default: {
          rect: {
            north: 1,
            east: 2,
            south: 3,
            west: 4,
          },
          height: 3,
          strokeColor: "red",
        },
      },
    },
  });
});

test("photooverlay", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "photooverlay",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    photooverlay: {
      hoge: "red",
    },
    compat: {
      extensionId: "photooverlay",
      propertyId: "p",
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          hoge: "red",
        },
      },
    },
  });
});

test("ellipsoid", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "ellipsoid",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          position: { lat: 1, lng: 2 },
          height: 3,
          radii: 100,
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    visible: true,
    ellipsoid: {
      radii: 100,
    },
    compat: {
      extensionId: "ellipsoid",
      propertyId: "p",
      property: {
        default: {
          position: { lat: 1, lng: 2 },
          height: 3,
          radii: 100,
        },
      },
    },
  });
});

test("model", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "model",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          model: "xxx",
          location: { lat: 1, lng: 2 },
          height: 3,
        },
        appearance: {
          aaa: 1,
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    model: {
      model: "xxx",
      aaa: 1,
    },
    compat: {
      extensionId: "model",
      propertyId: "p",
      property: {
        default: {
          model: "xxx",
          location: { lat: 1, lng: 2 },
          height: 3,
        },
        appearance: {
          aaa: 1,
        },
      },
    },
  });
});

test("3dtiles", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "tileset",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          tileset: "xxx",
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    data: {
      type: "3dtiles",
      url: "xxx",
    },
    "3dtiles": {
      hoge: "red",
    },
    compat: {
      extensionId: "tileset",
      propertyId: "p",
      property: {
        default: {
          tileset: "xxx",
          hoge: "red",
        },
      },
    },
  });
});

test("resource", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "resource",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          url: "xxx",
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    resource: {
      url: "xxx",
      hoge: "red",
    },
    compat: {
      extensionId: "resource",
      propertyId: "p",
      property: {
        default: {
          url: "xxx",
          hoge: "red",
        },
      },
    },
  });

  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "resource",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          url: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [2, 1, 3],
                [3, 2, 4],
              ],
            },
          },
          type: "geojson",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    resource: {
      url: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 1, 3],
            [3, 2, 4],
          ],
        },
      },
      type: "geojson",
    },
    data: {
      value: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 1, 3],
            [3, 2, 4],
          ],
        },
      },
      type: "geojson",
    },
    compat: {
      extensionId: "resource",
      propertyId: "p",
      property: {
        default: {
          url: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [2, 1, 3],
                [3, 2, 4],
              ],
            },
          },
          type: "geojson",
        },
      },
    },
  });
});

test("box", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      extensionId: "box",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          color: "red",
          location: {
            lng: 1,
            lat: 2,
            height: 3,
          },
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    box: {
      color: "red",
    },
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
    compat: {
      extensionId: "box",
      propertyId: "p",
      property: {
        default: {
          color: "red",
          location: {
            lng: 1,
            lat: 2,
            height: 3,
          },
        },
      },
    },
  });
});
