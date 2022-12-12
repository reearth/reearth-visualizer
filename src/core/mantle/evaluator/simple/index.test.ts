import { expect, test } from "vitest";

import { evalLayerAppearances, evalSimpleLayer } from ".";

test("evalLayerAppearances", async () => {
  expect(
    await evalSimpleLayer(
      {
        id: "x",
        type: "simple",
        data: {
          type: "geojson",
        },
        marker: {
          pointColor: "red",
          pointSize: { conditions: [["true", "1"]] },
        },
      },
      {
        getAllFeatures: async () => [{ id: "a" }],
        getFeatures: async () => undefined,
      },
    ),
  ).toEqual({
    layer: {
      marker: {
        pointColor: "red",
        pointSize: undefined,
      },
    },
    features: [
      {
        id: "a",
        marker: {
          pointColor: "red",
          pointSize: undefined,
        },
      },
    ],
  });
});

test("evalLayerAppearances", () => {
  expect(
    evalLayerAppearances(
      {
        marker: {
          pointColor: "red",
          pointSize: { conditions: [["true", "1"]] },
        },
      },
      {
        id: "x",
        type: "simple",
      },
      {
        id: "y",
      },
    ),
  ).toEqual({
    marker: {
      pointColor: "red",
      pointSize: undefined,
    },
  });
});
