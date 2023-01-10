import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { test, expect, vi, beforeEach } from "vitest";

import * as DataCache from "../data";
import { EvalContext, evalLayer } from "../evaluator";
import type { Data, DataRange, Feature, Layer, LayerSimple } from "../types";

import { doubleKeyCacheAtom } from "./cache";
import { computeAtom } from "./compute";

type TestData = Data & { test_id: string };

const data: TestData = {
  test_id: "a",
  type: "geojson",
  url: "https://example.com/example.geojson",
};
const range: DataRange = { x: 0, y: 0, z: 0 };
const layer: Layer = { id: "xxx", type: "simple", data };
const features: Feature[] = [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] } }];
const features2: Feature[] = [
  {
    id: "b",
    geometry: { type: "Point", coordinates: [0, 0] },
    range,
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

test("computeAtom", async () => {
  const fetchDataMock = vi.spyOn(DataCache, "fetchData");
  fetchDataMock.mockReturnValue(Promise.resolve(features));

  const { result } = renderHook(() => {
    const atoms = useMemo(() => computeAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const [result, set] = useAtom(atoms);
    return { result, set };
  });

  expect(result.current.result).toBeUndefined();

  act(() => {
    result.current.set({ type: "setLayer", layer: { id: "xxx", type: "simple" } });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer: { id: "xxx", type: "simple" },
    status: "ready",
    features: [],
    originalFeatures: [],
  });

  // set a layer with delegatedDataTypes
  act(() => {
    result.current.set({ type: "updateDelegatedDataTypes", delegatedDataTypes: ["geojson"] });
  });

  act(() => {
    result.current.set({ type: "setLayer", layer });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [],
    originalFeatures: [],
  }),
    await waitFor(() =>
      expect(result.current.result).toEqual({
        id: "xxx",
        layer,
        status: "ready",
        features: [],
        originalFeatures: [],
      }),
    );

  // delete delegatedDataTypes
  act(() => {
    result.current.set({ type: "updateDelegatedDataTypes", delegatedDataTypes: [] });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [],
    originalFeatures: [],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features,
      originalFeatures: features,
    }),
  );

  // reset a layer
  act(() => {
    result.current.set({ type: "setLayer", layer });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features,
    originalFeatures: features,
  });

  await waitFor(() => {
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features,
      originalFeatures: features,
    });
  });

  // write features
  act(() => {
    result.current.set({ type: "writeFeatures", features: features2 });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features,
    originalFeatures: [...features, ...features2],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: [...features, ...features2],
      originalFeatures: [...features, ...features2],
    }),
  );

  // override appearances
  act(() => {
    result.current.set({
      type: "override",
      overrides: {
        marker: { pointColor: "red" },
        hogehoge: { foobar: 1 }, // invalid appearance
      },
    });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "ready",
    features: [...features, ...features2].map(f => ({ ...f, marker: { pointColor: "red" } })),
    originalFeatures: [...features, ...features2],
  });

  // delete a feature
  act(() => {
    result.current.set({ type: "override" });
    result.current.set({ type: "deleteFeatures", features: ["b"] });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [...features, ...features2],
    originalFeatures: features,
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features,
      originalFeatures: features,
    }),
  );

  // delete a layer
  act(() => {
    result.current.set({ type: "setLayer" });
  });

  expect(result.current.result).toBeUndefined();
});

test("computeAtom with cache", async () => {
  const fetchDataMock = vi.spyOn(DataCache, "fetchData");
  fetchDataMock.mockImplementation(async data => {
    return [
      {
        id: (data as any).test_id || "",
        geometry: data.value?.geometry || { type: "Point", coordinates: [0, 0] },
      },
    ];
  });
  const internalFeatures: Feature[] = [
    { id: features[0].id, geometry: { type: "Point", coordinates: [1, 1] } },
  ];
  const { result } = renderHook(() => {
    const atoms = useMemo(() => computeAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const [result, set] = useAtom(atoms);
    return { result, set };
  });

  expect(result.current.result).toBeUndefined();

  // Set data.url
  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data,
        },
      }),
    );
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer: {
      id: "xxx",
      type: "simple",
      data,
    },
    status: "ready",
    features: features,
    originalFeatures: [...features],
  });

  expect(fetchDataMock).toBeCalledTimes(1);

  const sharedData = {
    test_id: "a",
    type: "geojson",
    value: { type: "Feature", geometry: internalFeatures[0].geometry },
  } as TestData;

  // Set `data.value` and add marker property.
  // It should replace existing cache with new data.
  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data: sharedData,
          marker: {
            imageColor: "black",
          },
        },
      }),
    );
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer: {
      id: "xxx",
      type: "simple",
      data: sharedData,
      marker: {
        imageColor: "black",
      },
    },
    status: "ready",
    features: internalFeatures,
    originalFeatures: [...internalFeatures],
  });

  expect(fetchDataMock).toBeCalledTimes(2);

  // Set same `data.value` and change marker imageColor.
  // It should not replace existing cache when same data is specified.
  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data: sharedData,
          marker: {
            imageColor: "white",
          },
        },
      }),
    );
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer: {
      id: "xxx",
      type: "simple",
      data: sharedData,
      marker: {
        imageColor: "white",
      },
    },
    status: "ready",
    features: internalFeatures,
    originalFeatures: [...internalFeatures],
  });

  // It should not be invoked when the data is same.
  expect(fetchDataMock).toBeCalledTimes(2);

  // Set `data.url`.
  // It should replace existing cache with new data.
  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data: {
            test_id: "a",
            type: "geojson",
            url: "https://example.com/example-1.geojson",
          } as TestData,
        },
      }),
    );
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer: {
      id: "xxx",
      type: "simple",
      data: {
        test_id: "a",
        type: "geojson",
        url: "https://example.com/example-1.geojson",
      },
    },
    status: "ready",
    features: [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] } }],
    originalFeatures: [{ id: "a", geometry: { type: "Point", coordinates: [0, 0] } }],
  });

  expect(fetchDataMock).toBeCalledTimes(3);
});

vi.mock("../evaluator", (): { evalLayer: typeof evalLayer } => ({
  evalLayer: async (layer: LayerSimple, ctx: EvalContext) => {
    if (!layer.data) return { layer: {}, features: undefined };
    return { layer: {}, features: await ctx.getAllFeatures(layer.data) };
  },
}));
