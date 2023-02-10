import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";

import useHooks, { type Layer, type Ref } from "./hooks";

test("hooks", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
        },
      ],
    },
    { id: "w", type: "simple", title: "W" },
  ];

  const {
    result: { current },
  } = renderHook(() => useHooks({ layers }));

  expect(current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);
  expect(current.atomMap.get("y")).not.toBeUndefined();
  expect(current.atomMap.get("v")).toBeUndefined();
});

test("isLayer", () => {
  const layers: Layer[] = [{ id: "x", type: "simple" }];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.isLayer(1)).toBe(false);
  expect(ref?.isLayer({})).toBe(false);
  const layer = ref?.findById("x");
  if (!layer) throw new Error("layer is not found");
  expect(ref?.isLayer(layer)).toBe(true);
});

test("layers", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple" },
    { id: "y", type: "group", children: [{ id: "z", type: "simple" }] },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  const res = ref?.layers();
  expect(res).toHaveLength(2);
  expect(res?.[0].id).toBe("x");
  expect(res?.[1].id).toBe("y");
});

test("findById", () => {
  const layers: Layer[] = [{ id: "x", type: "simple", title: "X" }];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findById("y")).toBeUndefined();
  const layer = ref?.findById("x");
  expect(layer?.id).toBe("x");
  expect(layer?.title).toBe("X");
  expect(layer?.computed).toBeUndefined();
});

test("findByIds", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByIds("a", "b")).toEqual([undefined, undefined]);

  const found = ref?.findByIds("x", "y");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("walk", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
    { id: "w", type: "simple", title: "W" },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  const cb1 = vi.fn(() => "a");
  expect(ref?.walk(cb1)).toBe("a");
  expect(cb1.mock.calls).toEqual([[{ id: "x" }, 0, [{ id: "x" }, { id: "z" }, { id: "w" }]]]);

  const cb2 = vi.fn();
  expect(ref?.walk(cb2)).toBeUndefined();
  expect(cb2.mock.calls).toEqual([
    [{ id: "x" }, 0, [{ id: "x" }, { id: "z" }, { id: "w" }]],
    [{ id: "z" }, 1, [{ id: "x" }, { id: "z" }, { id: "w" }]],
    [{ id: "y" }, 0, [{ id: "y" }]],
    [{ id: "w" }, 2, [{ id: "x" }, { id: "z" }, { id: "w" }]],
  ]);
});

test("find", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.find(l => l.title === "A")).toBeUndefined();

  const found = ref?.find(l => l.title === "X" || l.title === "Y");
  expect(found?.id).toBe("x");
  expect(found?.title).toBe("X");
});

test("findAll", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "z", type: "group", children: [{ id: "y", type: "simple", title: "Y" }] },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findAll(l => l.title === "A")).toEqual([]);

  const found = ref?.findAll(l => l.title === "X" || l.title === "Y");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("findByTags", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X", tags: [{ id: "tag", label: "Tag" }] },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          tags: [
            { id: "tag2", label: "Tag2" },
            { id: "tag", label: "Tag" },
          ],
        },
      ],
    },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByTags("Tag")).toEqual([]);

  const found = ref?.findByTags("tag", "tag2");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("findByTagLabels", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X", tags: [{ id: "tag", label: "Tag" }] },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          tags: [
            { id: "tag2", label: "Tag2" },
            { id: "tag", label: "Tag" },
          ],
        },
      ],
    },
  ];

  const {
    result: {
      current: { current: ref },
    },
  } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const _ = useHooks({ layers, ref });
    return ref;
  });

  expect(ref?.findByTagLabels("tag")).toEqual([]);

  const found = ref?.findByTagLabels("Tag", "Tag2");
  expect(found?.[0]?.id).toBe("x");
  expect(found?.[0]?.title).toBe("X");
  expect(found?.[1]?.id).toBe("y");
  expect(found?.[1]?.title).toBe("Y");
});

test("add, replace, delete", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
        },
      ],
    },
    { id: "w", type: "simple", title: "W" },
  ];

  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ layers, ref });
    return { ref, flattenedLayers };
  });

  const idLength = 36;
  const addedLayers = result.current.ref.current?.addAll({
    type: "group",
    title: "C",
    children: [
      {
        type: "group",
        title: "B",
        children: [
          {
            type: "simple",
            title: "A",
            infobox: {
              blocks: [{ extensionId: "a" }],
            },
          },
        ],
      },
    ],
  });
  const l = addedLayers?.[0];
  expect(l?.id).toBeTypeOf("string");
  expect(l?.id).toHaveLength(idLength);
  expect(l?.type).toBe("group");
  expect(l?.title).toBe("C");
  if (l?.type !== "group") throw new Error("invalid layer type");
  expect(l.children[0].id).toBeTypeOf("string");
  expect(l.children[0].id).toHaveLength(idLength);
  expect(l.children[0].type).toBe("group");
  expect(l.children[0].title).toBe("B");
  if (l.children[0].type !== "group") throw new Error("invalid layer type");
  expect(l.children[0].children[0].id).toBeTypeOf("string");
  expect(l.children[0].children[0].id).toHaveLength(idLength);
  expect(l.children[0].children[0].type).toBe("simple");
  expect(l.children[0].children[0].title).toBe("A");
  expect(l.children[0].children[0].infobox?.blocks?.[0].id).toBeTypeOf("string");
  expect(l.children[0].children[0].infobox?.blocks?.[0].id).toHaveLength(idLength);

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
    {
      id: l.children[0].children[0].id,
      type: "simple",
      title: "A",
      infobox: {
        blocks: [{ id: l.children[0].children[0].infobox?.blocks?.[0].id, extensionId: "a" }],
      },
    },
  ]);

  result.current.ref.current?.replace({
    id: l.children[0].children[0].id,
    type: "simple",
    title: "A!",
  });

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
    {
      id: l.children[0].children[0].id,
      type: "simple",
      title: "A!",
    },
  ]);

  result.current.ref.current?.deleteLayer(l.children[0].id, "w");

  rerender();

  expect(result.current.flattenedLayers).toEqual([
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
    { id: "w", type: "simple", title: "W" },
  ]);
});

test("override", () => {
  const dataValue = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [1, 2] },
    hoge: "foobar", // test
  };
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          data: { type: "geojson", value: dataValue },
          marker: { pointSize: 10, pointColor: "red" },
        },
      ],
    },
  ];

  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ layers, ref });
    return { ref, flattenedLayers };
  });

  const dataValue2 = {
    type: "geojson",
    value: { type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } },
  };
  result.current.ref.current?.override("y", {
    id: "z", // should be ignored
    ...({
      type: "group", // should be ignored
    } as any),
    title: "Y!",
    data: { value: dataValue2 },
    marker: { pointSize: 100 },
    tags: [{ id: "t", label: "t" }],
  });
  rerender();
  const l = result.current.flattenedLayers[1];
  if (l.type !== "simple") throw new Error("invalid layer type");
  expect(l.title).toBe("Y!");
  expect(l.data?.value).toBe(dataValue2);
  expect(l.marker).toEqual({ pointSize: 100, pointColor: "red" });
  expect(l.tags).toEqual([{ id: "t", label: "t" }]);
  expect(result.current.ref.current?.findById("y")?.title).toBe("Y");

  result.current.ref.current?.override("y", {
    title: "Y!!",
    marker: { pointColor: "blue" },
    tags: [{ id: "t2", label: "t2" }],
  });
  rerender();
  const l2 = result.current.flattenedLayers[1];
  if (l2.type !== "simple") throw new Error("invalid layer type");
  expect(l2.title).toBe("Y!!");
  expect(l2.data?.value).toBe(dataValue);
  expect(l2.marker).toEqual({ pointSize: 10, pointColor: "blue" });
  expect(l2.tags).toEqual([{ id: "t2", label: "t2" }]);

  result.current.ref.current?.override("y");
  rerender();
  const l3 = result.current.flattenedLayers[1];
  if (l3.type !== "simple") throw new Error("invalid layer type");
  expect(l3.title).toBe("Y");
  expect(l3.data?.value).toBe(dataValue);
  expect(l3.marker).toEqual({ pointSize: 10, pointColor: "red" });
  expect(l3.tags).toBeUndefined();
});

test("override property for compat", () => {
  const dataValue = {
    type: "Feature",
    id: "y",
    geometry: { type: "Point", coordinates: [1, 2] },
  };
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    {
      id: "z",
      type: "group",
      children: [
        {
          id: "y",
          type: "simple",
          title: "Y",
          data: { type: "geojson", value: dataValue },
          marker: { pointSize: 10, pointColor: "red" },
          compat: {
            extensionId: "marker",
          },
        },
      ],
    },
  ];

  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ layers, ref });
    return { ref, flattenedLayers };
  });

  result.current.ref.current?.override("y", {
    property: {
      default: {
        pointSize: 100,
        location: {
          lat: 1,
          lng: 2,
        },
      },
    },
  });
  rerender();
  const l = result.current.flattenedLayers[1];
  if (l.type !== "simple") throw new Error("invalid layer type");
  expect(l.title).toBe("Y");
  expect(l.data?.value).toEqual({
    ...dataValue,
    geometry: { ...dataValue.geometry, coordinates: [2, 1] },
  });
  expect(l.marker).toEqual({ pointSize: 100, pointColor: "red" });
  expect(l.tags).toBeUndefined();

  result.current.ref.current?.override("y", {
    property: {
      pointSize: 200,
    },
  });
  rerender();
  const l2 = result.current.flattenedLayers[1];
  if (l2.type !== "simple") throw new Error("invalid layer type");
  expect(l2.data?.value).toBe(dataValue);
  expect(l2.marker).toEqual({ pointSize: 10, pointColor: "red" });

  result.current.ref.current?.override("y");
  rerender();
  const l3 = result.current.flattenedLayers[1];
  if (l3.type !== "simple") throw new Error("invalid layer type");
  expect(l3.title).toBe("Y");
  expect(l3.data?.value).toBe(dataValue);
  expect(l3.marker).toEqual({ pointSize: 10, pointColor: "red" });
  expect(l3.tags).toBeUndefined();
});

test("hide and show", () => {
  const layers: Layer[] = [
    { id: "x", type: "simple", title: "X" },
    { id: "y", type: "simple", title: "Y" },
  ];

  const { result, rerender } = renderHook(
    ({ hiddenLayers }: { hiddenLayers: string[] }) => {
      const ref = useRef<Ref>(null);
      const { isHidden } = useHooks({ layers, ref, hiddenLayers });
      return { ref, isHidden };
    },
    {
      initialProps: { hiddenLayers: ["y"] },
    },
  );

  expect(result.current.isHidden("x")).toBe(false);
  expect(result.current.isHidden("y")).toBe(true);

  result.current.ref.current?.hide("x");
  rerender({ hiddenLayers: ["y"] });

  expect(result.current.isHidden("x")).toBe(true);
  expect(result.current.isHidden("y")).toBe(true);

  rerender({ hiddenLayers: ["x"] });

  expect(result.current.isHidden("x")).toBe(true);
  expect(result.current.isHidden("y")).toBe(false);

  result.current.ref.current?.show("x");
  result.current.ref.current?.show("y");
  rerender({ hiddenLayers: ["x"] });

  expect(result.current.isHidden("x")).toBe(true);
  expect(result.current.isHidden("y")).toBe(false);

  rerender({ hiddenLayers: [] });

  expect(result.current.isHidden("x")).toBe(false);
  expect(result.current.isHidden("y")).toBe(false);
});

test("compat", () => {
  const { result, rerender } = renderHook(() => {
    const ref = useRef<Ref>(null);
    const { flattenedLayers } = useHooks({ ref });
    return { ref, flattenedLayers };
  });

  result.current.ref.current?.add({
    type: "item",
    title: "X",
    extensionId: "marker",
    property: {
      default: {
        location: { lat: 1, lng: 2 },
        pointSize: 10,
      },
    },
  } as any);
  rerender();
  const l = result.current.flattenedLayers[0];
  if (l.type !== "simple") throw new Error("invalid layer type");
  expect(l.title).toBe("X");
  expect(l.marker).toEqual({ pointSize: 10 });
  expect(l.data).toEqual({
    type: "geojson",
    value: { type: "Feature", geometry: { type: "Point", coordinates: [2, 1] } },
  });

  const l2: any = result.current.ref.current?.findById(l.id);
  expect(l2.marker).toEqual({ pointSize: 10 });
  expect(l2.pluginId).toBe("reearth");
  expect(l2.extensionId).toBe("marker");
  expect(l2.property).toEqual({
    default: {
      location: { lat: 1, lng: 2 },
      pointSize: 10,
    },
  });

  result.current.ref.current?.override(l.id, {
    marker: { pointColor: "blue" },
  });
  rerender();
  const l3 = result.current.flattenedLayers[0];
  if (l3.type !== "simple") throw new Error("invalid layer type");
  expect(l3.marker).toEqual({ pointSize: 10, pointColor: "blue" });
  expect(l3.compat?.property).toEqual({
    default: {
      location: { lat: 1, lng: 2 },
      pointSize: 10,
    },
  });

  const l4: any = result.current.ref.current?.findById(l.id);
  expect(l4.marker).toEqual({ pointSize: 10 });
  expect(l4.pluginId).toBe("reearth");
  expect(l4.extensionId).toBe("marker");
  expect(l4.property).toEqual({
    default: {
      location: { lat: 1, lng: 2 },
      pointSize: 10,
    },
  });

  result.current.ref.current?.override(l.id, {
    property: { default: { pointColor: "yellow" } },
  } as any);
  rerender();
  const l5 = result.current.flattenedLayers[0];
  if (l5.type !== "simple") throw new Error("invalid layer type");
  expect(l5.marker).toEqual({ pointSize: 10, pointColor: "yellow" });
  expect(l5.compat?.property).toEqual({
    default: {
      location: { lat: 1, lng: 2 },
      pointSize: 10,
    },
  });

  const l6: any = result.current.ref.current?.findById(l.id);
  expect(l6.marker).toEqual({ pointSize: 10 });
  expect(l6.pluginId).toBe("reearth");
  expect(l6.extensionId).toBe("marker");
  expect(l6.property).toEqual({
    default: {
      location: { lat: 1, lng: 2 },
      pointSize: 10,
    },
  });
});

test("select", () => {
  const handleLayerSelect = vi.fn();
  const initialLayers: Layer[] = [
    {
      id: "x",
      type: "simple",
    },
  ];
  const { result, rerender } = renderHook(
    ({ layers }: { layers?: Layer[] } = {}) => {
      const ref = useRef<Ref>(null);
      useHooks({ ref, layers, onLayerSelect: handleLayerSelect });
      return { ref };
    },
    {
      initialProps: {
        layers: initialLayers,
      },
    },
  );

  // select
  handleLayerSelect.mockClear();
  result.current.ref.current?.select("x", "y", { reason: "reason" });
  rerender({ layers: initialLayers });
  expect(result.current.ref.current?.selectedLayer()).toEqual({
    id: "x",
  });
  expect(handleLayerSelect).toBeCalledWith("x", "y", expect.any(Function), { reason: "reason" });
  expect(handleLayerSelect).toBeCalledTimes(1);

  // remove reason
  handleLayerSelect.mockClear();
  result.current.ref.current?.select("x");
  rerender({ layers: initialLayers });
  expect(result.current.ref.current?.selectedLayer()).toEqual({
    id: "x",
  });
  expect(handleLayerSelect).toBeCalledWith("x", undefined, expect.any(Function), undefined);
  expect(handleLayerSelect).toBeCalledTimes(1);

  // delete layers
  handleLayerSelect.mockClear();
  rerender({ layers: [] });
  expect(result.current.ref.current?.selectedLayer()).toBeUndefined();
  expect(handleLayerSelect).toBeCalledWith(undefined, undefined, undefined, undefined);
  expect(handleLayerSelect).toBeCalledTimes(1);

  // select a layer that does not exist
  handleLayerSelect.mockClear();
  result.current.ref.current?.select("y");
  rerender();
  expect(result.current.ref.current?.selectedLayer()).toBeUndefined();
  expect(handleLayerSelect).toBeCalled();

  // unselect
  handleLayerSelect.mockClear();
  result.current.ref.current?.select(undefined);
  rerender();
  expect(result.current.ref.current?.selectedLayer()).toBeUndefined();
  expect(handleLayerSelect).not.toBeCalled();
});
