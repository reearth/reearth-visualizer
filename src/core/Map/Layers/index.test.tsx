import { useEffect, useRef, useState } from "react";
import { expect, test, vi } from "vitest";

import { render, screen, waitFor } from "@reearth/test/utils";

import Component, { LayerSimple, Layer, FeatureComponentProps, Ref } from ".";

test("simple", () => {
  const Feature = vi.fn((_: FeatureComponentProps) => <div>Hello</div>);
  const layers: LayerSimple[] = [
    { id: "a", type: "simple" },
    { id: "b", type: "simple" },
  ];
  const { rerender } = render(<Component layers={layers} Feature={Feature} />);

  expect(screen.getAllByText("Hello")[0]).toBeVisible();
  expect(screen.getAllByText("Hello")).toHaveLength(2);
  expect(Feature).toBeCalledTimes(2);
  expect(Feature.mock.calls[0][0]).toEqual({
    isHidden: false,
    isSelected: false,
    layer: {
      id: "a",
      features: [],
      layer: layers[0],
      status: "ready",
      originalFeatures: [],
    },
    onFeatureDelete: expect.any(Function),
    onFeatureFetch: expect.any(Function),
    onFeatureRequest: expect.any(Function),
  });
  expect(Feature.mock.calls[1][0]).toEqual({
    isHidden: false,
    isSelected: false,
    layer: {
      id: "b",
      features: [],
      layer: layers[1],
      status: "ready",
      originalFeatures: [],
    },
    onFeatureDelete: expect.any(Function),
    onFeatureFetch: expect.any(Function),
    onFeatureRequest: expect.any(Function),
  });

  Feature.mockClear();

  const layers2: LayerSimple[] = [{ id: "c", type: "simple" }];
  rerender(<Component layers={layers2} Feature={Feature} />);
  expect(screen.getByText("Hello")).toBeVisible();
  expect(Feature.mock.calls[0][0].layer).toEqual({
    id: "c",
    features: [],
    layer: layers2[0],
    status: "ready",
    originalFeatures: [],
  });
});

test("tree", () => {
  const Feature = vi.fn((_: FeatureComponentProps) => null);
  const layers: Layer[] = [
    {
      id: "a",
      type: "group",
      children: [
        { id: "b", type: "simple" },
        { id: "c", type: "group", children: [] },
      ],
    },
  ];
  render(<Component layers={layers} Feature={Feature} />);

  expect(Feature).toBeCalledTimes(1);
  expect(Feature.mock.calls[0][0].layer).toEqual({
    id: "b",
    features: [],
    layer: { id: "b", type: "simple" },
    status: "ready",
    originalFeatures: [],
  });
});

test("ref", async () => {
  const Feature = vi.fn((_: FeatureComponentProps) => null);

  function Comp({ del, replace }: { del?: boolean; replace?: boolean }) {
    const ref = useRef<Ref>(null);
    const layerId = useRef("");
    const [s, ss] = useState("");

    useEffect(() => {
      if (del) {
        ref.current?.deleteLayer(layerId.current);
        ss(ref.current?.findById(layerId.current)?.title ?? "");
      } else if (replace) {
        ref.current?.replace({ id: layerId.current, type: "simple", title: "A" });
        ss(ref.current?.findById(layerId.current)?.title ?? "");
      } else {
        const newLayer = ref.current?.add({ type: "simple", title: "a" });
        layerId.current = newLayer?.id ?? "";
        ss(newLayer?.title ?? "");
      }
    }, [del, replace]);

    return (
      <>
        <Component ref={ref} Feature={Feature} />
        <p data-testid="layer">{s}</p>
      </>
    );
  }

  // add should add layers and getLayer should return a lazy layer
  const { rerender } = render(<Comp />);

  await waitFor(() => expect(screen.getByTestId("layer")).toHaveTextContent("a"));

  expect(Feature).toBeCalledTimes(1);
  expect(Feature.mock.calls[0][0].layer).toEqual({
    id: expect.any(String),
    features: [],
    layer: { id: expect.any(String), type: "simple", title: "a" },
    status: "ready",
    originalFeatures: [],
  });

  // update should update the layer
  rerender(<Comp replace />);

  await waitFor(() => expect(screen.getByTestId("layer")).toHaveTextContent("A"));

  // deleteLayer should delete the layer and getLayer should return nothing
  rerender(<Comp del />);

  await waitFor(() => expect(screen.getByTestId("layer")).toBeEmptyDOMElement());
});

test("computed", async () => {
  const layers: Layer[] = [
    {
      id: "x",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [0, 1],
          },
        },
      },
      marker: {
        pointColor: "red",
      },
    },
  ];

  const Feature = (_: FeatureComponentProps) => null;

  function Comp({ layers }: { layers?: Layer[] }) {
    const ref = useRef<Ref>(null);
    return (
      <>
        <Component layers={layers} ref={ref} Feature={Feature} />
        <p data-testid="layer">{ref.current?.findById("x")?.computed?.id}</p>
      </>
    );
  }

  const { rerender } = render(<Comp layers={layers} />);
  rerender(<Comp layers={layers} />);
  await waitFor(() => expect(screen.getByTestId("layer")).toHaveTextContent("x"));
});
