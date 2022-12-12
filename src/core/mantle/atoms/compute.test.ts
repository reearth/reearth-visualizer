import { renderHook, act, waitFor } from "@testing-library/react";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { test, expect, vi } from "vitest";

import { fetchData } from "../data";
import { EvalContext, evalLayer } from "../evaluator";
import type { Data, DataRange, Feature, Layer, LayerSimple } from "../types";

import { doubleKeyCacheAtom } from "./cache";
import { computeAtom } from "./compute";

const data: Data = { type: "geojson", url: "https://example.com/example.geojson" };
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

test("computeAtom", async () => {
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

vi.mock("../evaluator", (): { evalLayer: typeof evalLayer } => ({
  evalLayer: async (layer: LayerSimple, ctx: EvalContext) => {
    if (!layer.data) return { layer: {}, features: undefined };
    return { layer: {}, features: await ctx.getAllFeatures(layer.data) };
  },
}));

vi.mock("../data", (): { fetchData: typeof fetchData } => ({
  fetchData: async () => features,
}));
