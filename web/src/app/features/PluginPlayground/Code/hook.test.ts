import { MapRef } from "@reearth/core";
import { act, renderHook } from "@testing-library/react";
import { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

import { FileType } from "../Plugins/constants";

import useCode from "./hook";

const yml = (id = "demo"): FileType => ({
  id: "reearth.yml",
  title: "reearth.yml",
  sourceCode: `id: ${id}\nextensions:\n  - id: a\n    type: widget\n    schema:\n      groups:\n        - id: default\n          fields:\n            - id: label\n              type: string\n`
});
const js = (code: string): FileType => ({
  id: "a.js",
  title: "a.js",
  sourceCode: code
});

// A map whose layers are the playground's own plus one a plugin added.
const fakeMap = () => {
  const deleteLayer = vi.fn();
  const map = {
    layers: {
      layers: () => [{ id: "base" }, { id: "added" }],
      isTempLayer: (id?: string) => id === "added",
      deleteLayer
    }
  } as unknown as MapRef;
  return { ref: { current: map } as RefObject<MapRef | null>, deleteLayer };
};

const sourceOf = (widgets: ReturnType<typeof useCode>["widgets"]) =>
  (
    widgets?.alignSystem?.outer?.left?.top?.widgets?.[0] as
      | { __REEARTH_SOURCECODE?: string }
      | undefined
  )?.__REEARTH_SOURCECODE;

describe("useCode executeCode", () => {
  it("keeps the map for the first run and for runs with the same code", () => {
    const resetVisualizer = vi.fn();
    const { ref, deleteLayer } = fakeMap();
    const { result, rerender } = renderHook(
      ({ fieldValues }) =>
        useCode({
          files: [yml(), js("run()")],
          fieldValues,
          resetVisualizer,
          visualizerRef: ref
        }),
      { initialProps: { fieldValues: {} } }
    );

    act(() => result.current.executeCode());
    expect(resetVisualizer).not.toHaveBeenCalled();
    expect(sourceOf(result.current.widgets)).toBe("run()");

    // Only a property changed: the plugin reruns without what it added.
    rerender({ fieldValues: { "demo-a-default-label": "x" } });
    act(() => result.current.executeCode());
    expect(resetVisualizer).not.toHaveBeenCalled();
    expect(deleteLayer).toHaveBeenCalledWith("added");
    expect(sourceOf(result.current.widgets)).not.toBe("run()");
    expect(sourceOf(result.current.widgets)).toMatch(/^run\(\)\n/);
  });

  it("remounts the map when the code changed", () => {
    const resetVisualizer = vi.fn();
    const { ref } = fakeMap();
    const { result, rerender } = renderHook(
      ({ code }) =>
        useCode({
          files: [yml(), js(code)],
          fieldValues: {},
          resetVisualizer,
          visualizerRef: ref
        }),
      { initialProps: { code: "run()" } }
    );

    act(() => result.current.executeCode());
    rerender({ code: "run2()" });
    act(() => result.current.executeCode());

    expect(resetVisualizer).toHaveBeenCalledTimes(1);
    expect(sourceOf(result.current.widgets)).toBe("run2()");
  });

  it("remounts the map when there's no map to keep", () => {
    const resetVisualizer = vi.fn();
    const { result } = renderHook(() =>
      useCode({
        files: [yml(), js("run()")],
        fieldValues: {},
        resetVisualizer
      })
    );

    act(() => result.current.executeCode());
    expect(resetVisualizer).toHaveBeenCalledTimes(1);
  });

  it("keeps a plugin widget in the bottom left next to the built-in one", () => {
    const manifest: FileType = {
      id: "reearth.yml",
      title: "reearth.yml",
      sourceCode:
        "id: demo\nextensions:\n  - id: a\n    type: widget\n    widgetLayout:\n      defaultLocation: { zone: outer, section: left, area: bottom }\n"
    };
    const { result } = renderHook(() =>
      useCode({
        files: [manifest, js("run()")],
        fieldValues: {},
        resetVisualizer: vi.fn()
      })
    );

    act(() => result.current.executeCode());
    expect(
      result.current.widgets?.alignSystem?.outer?.left?.bottom?.widgets?.map(
        (w) => w.extensionId
      )
    ).toEqual(["a", "dataAttribution"]);
  });
});
