import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { test, expect, vi, beforeEach } from "vitest";

import * as DataCache from "../data";
import { EvalContext, evalLayer } from "../evaluator";
import type { ComputedFeature, Data, DataRange, Feature, Layer, LayerSimple } from "../types";

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
const features: Feature[] = [
  { type: "feature", id: "a", geometry: { type: "Point", coordinates: [0, 0] } },
];
const features2: Feature[] = [
  {
    type: "feature",
    id: "b",
    geometry: { type: "Point", coordinates: [0, 0] },
    range,
  },
];
const features3: Feature[] = [
  {
    type: "feature",
    id: "c",
    geometry: { type: "Point", coordinates: [0, 0] },
    range,
  },
];

const toComputedFeature = (f: Feature[]): ComputedFeature[] =>
  f.map(v => ({ ...v, type: "computedFeature" }));

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
    status: "ready",
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
      features: toComputedFeature(features),
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
    features: toComputedFeature(features),
    originalFeatures: features,
  });

  await waitFor(() => {
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: toComputedFeature(features),
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
    features: toComputedFeature(features),
    originalFeatures: [...features, ...features2],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: [...toComputedFeature(features), ...toComputedFeature(features2)],
      originalFeatures: [...features, ...features2],
    }),
  );

  // set a layer with delegatedDataTypes
  act(() => {
    result.current.set({ type: "updateDelegatedDataTypes", delegatedDataTypes: ["geojson"] });
  });

  // write computed features
  act(() => {
    result.current.set({
      type: "writeComputedFeatures",
      value: { feature: features3, computed: toComputedFeature(features3) },
    });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [...toComputedFeature(features), ...toComputedFeature(features2)],
    originalFeatures: [...features, ...features3],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: [
        ...toComputedFeature(features),
        ...toComputedFeature(features2),
        ...toComputedFeature(features3),
      ],
      originalFeatures: [...features, ...features3],
    }),
  );

  // delete delegatedDataTypes
  act(() => {
    result.current.set({ type: "updateDelegatedDataTypes", delegatedDataTypes: [] });
  });

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
    status: "fetching",
    features: [...features, ...features2, ...features3].map(f => ({
      ...f,
      type: "computedFeature",
      marker: { pointColor: "red" },
    })),
    originalFeatures: [...features, ...features3],
  });

  // delete a feature b
  act(() => {
    result.current.set({ type: "override" });
    result.current.set({ type: "deleteFeatures", features: ["b"] });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [
      ...toComputedFeature(features),
      ...toComputedFeature(features2),
      ...toComputedFeature(features3),
    ],
    originalFeatures: [...features, ...features3],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: [...toComputedFeature(features), ...toComputedFeature(features3)],
      originalFeatures: [...features, ...features3],
    }),
  );

  // delete a feature c
  act(() => {
    result.current.set({ type: "override" });
    result.current.set({ type: "deleteFeatures", features: ["c"] });
  });

  expect(result.current.result).toEqual({
    id: "xxx",
    layer,
    status: "fetching",
    features: [...toComputedFeature(features), ...toComputedFeature(features3)],
    originalFeatures: [...features],
  });

  await waitFor(() =>
    expect(result.current.result).toEqual({
      id: "xxx",
      layer,
      status: "ready",
      features: toComputedFeature(features),
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
        type: "feature",
        id: (data as any).test_id || "",
        geometry: data.value?.geometry || { type: "Point", coordinates: [0, 0] },
      },
    ];
  });
  const internalFeatures: Feature[] = [
    { type: "feature", id: features[0].id, geometry: { type: "Point", coordinates: [1, 1] } },
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
    features: toComputedFeature(features),
    originalFeatures: [...features],
  });

  expect(fetchDataMock).toBeCalledTimes(1);

  const geometryOnlyData = {
    test_id: "a",
    type: "geojson",
    value: { type: "feature", geometry: internalFeatures[0].geometry },
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
          data: geometryOnlyData,
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
      data: geometryOnlyData,
      marker: {
        imageColor: "black",
      },
    },
    status: "ready",
    features: toComputedFeature(internalFeatures),
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
          data: geometryOnlyData,
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
      data: geometryOnlyData,
      marker: {
        imageColor: "white",
      },
    },
    status: "ready",
    features: toComputedFeature(internalFeatures),
    originalFeatures: [...internalFeatures],
  });

  // It should be invoked even if the data is same when data doesn't have cache key.
  expect(fetchDataMock).toBeCalledTimes(3);

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
    features: [
      { type: "computedFeature", id: "a", geometry: { type: "Point", coordinates: [0, 0] } },
    ],
    originalFeatures: [
      { type: "feature", id: "a", geometry: { type: "Point", coordinates: [0, 0] } },
    ],
  });

  expect(fetchDataMock).toBeCalledTimes(4);
});

test("computeAtom only value", async () => {
  const data: TestData = {
    test_id: "xxx",
    type: "geojson",
    value: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [1, 1],
      },
    },
  };
  const features: Feature[] = [
    { type: "feature", id: "xxx", geometry: { type: "Point", coordinates: [1, 1] } },
  ];
  const features2: Feature[] = [
    { type: "feature", id: "zzz", geometry: { type: "Point", coordinates: [100, 100] } },
  ];
  const fetchDataMock = vi.spyOn(DataCache, "fetchData");
  fetchDataMock.mockImplementation(async data => {
    return [
      {
        type: "feature",
        id: (data as any).test_id || "",
        geometry: data.value?.geometry || { type: "Point", coordinates: [0, 0] },
        properties: undefined,
        range: undefined,
      },
    ];
  });
  const internalFeatures: Feature[] = [
    { type: "feature", id: features[0].id, geometry: { type: "Point", coordinates: [1, 1] } },
  ];
  const internalFeatures2: Feature[] = [
    { type: "feature", id: features2[0].id, geometry: { type: "Point", coordinates: [100, 100] } },
  ];
  const { result } = renderHook(() => {
    const atoms = useMemo(() => computeAtom(doubleKeyCacheAtom<string, string, Feature[]>()), []);
    const [result, set] = useAtom(atoms);
    return { result, set };
  });

  expect(result.current.result).toBeUndefined();

  // Set data.value
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
    features: toComputedFeature(features),
    originalFeatures: [...features],
  });

  expect(fetchDataMock).toBeCalledTimes(1);

  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data,
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
      data,
      marker: {
        imageColor: "black",
      },
    },
    status: "ready",
    features: toComputedFeature(internalFeatures),
    originalFeatures: [...internalFeatures],
  });

  // Should not fetch if value is not changed
  expect(fetchDataMock).toBeCalledTimes(1);

  const changedData = {
    ...data,
    test_id: "zzz",
    value: {
      ...data.value,
      geometry: {
        type: "Point",
        coordinates: [100, 100],
      },
    },
  };

  await act(async () => {
    await waitFor(() =>
      result.current.set({
        type: "setLayer",
        layer: {
          id: "xxx",
          type: "simple",
          data: changedData,
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
      data: changedData,
      marker: {
        imageColor: "black",
      },
    },
    status: "ready",
    features: toComputedFeature(internalFeatures2),
    originalFeatures: [...internalFeatures2],
  });

  // Should fetch if value is changed
  expect(fetchDataMock).toBeCalledTimes(2);
});

vi.mock("../evaluator", (): { evalLayer: typeof evalLayer } => ({
  evalLayer: async (layer: LayerSimple, ctx: EvalContext) => {
    if (!layer.data) return { layer: {}, features: undefined };
    return { layer: {}, features: toComputedFeature((await ctx.getAllFeatures(layer.data)) || []) };
  },
}));
