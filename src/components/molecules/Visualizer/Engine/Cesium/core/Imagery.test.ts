import { renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { type Tile, useImageryProviders } from "./Imagery";

test("useImageryProviders", () => {
  const provider = vi.fn((url?: string): any => ({ hoge: url }));
  const provider2 = vi.fn((url?: string): any => ({ hoge2: url }));
  const presets = { default: provider, foobar: provider2 };
  const { result, rerender } = renderHook(
    ({ tiles, cesiumIonAccessToken }: { tiles: Tile[]; cesiumIonAccessToken?: string }) =>
      useImageryProviders({
        tiles,
        presets,
        cesiumIonAccessToken,
      }),
    { initialProps: { tiles: [{ id: "1", tile_type: "default" }] } },
  );

  expect(result.current.providers).toEqual({ "1": ["default", undefined, { hoge: undefined }] });
  expect(result.current.updated).toBe(true);
  expect(provider).toBeCalledTimes(1);
  const prevImageryProvider = result.current.providers["1"][2];

  // re-render with same tiles
  rerender({ tiles: [{ id: "1", tile_type: "default" }] });

  expect(result.current.providers).toEqual({ "1": ["default", undefined, { hoge: undefined }] });
  expect(result.current.updated).toBe(false);
  expect(result.current.providers["1"][2]).toBe(prevImageryProvider); // 1's provider should be reused
  expect(provider).toBeCalledTimes(1);

  // update a tile URL
  rerender({ tiles: [{ id: "1", tile_type: "default", tile_url: "a" }] });

  expect(result.current.providers).toEqual({ "1": ["default", "a", { hoge: "a" }] });
  expect(result.current.providers["1"][2]).not.toBe(prevImageryProvider);
  expect(result.current.updated).toBe(true);
  expect(provider).toBeCalledTimes(2);
  expect(provider).toBeCalledWith("a");
  const prevImageryProvider2 = result.current.providers["1"][2];

  // add a tile with URL
  rerender({
    tiles: [
      { id: "2", tile_type: "default" },
      { id: "1", tile_type: "default", tile_url: "a" },
    ],
  });

  expect(result.current.providers).toEqual({
    "2": ["default", undefined, { hoge: undefined }],
    "1": ["default", "a", { hoge: "a" }],
  });
  expect(result.current.updated).toBe(true);
  expect(result.current.providers["1"][2]).toBe(prevImageryProvider2); // 1's provider should be reused
  expect(provider).toBeCalledTimes(3);

  // sort tiles
  rerender({
    tiles: [
      { id: "1", tile_type: "default", tile_url: "a" },
      { id: "2", tile_type: "default" },
    ],
  });

  expect(result.current.providers).toEqual({
    "1": ["default", "a", { hoge: "a" }],
    "2": ["default", undefined, { hoge: undefined }],
  });
  expect(result.current.updated).toBe(true);
  expect(result.current.providers["1"][2]).toBe(prevImageryProvider2); // 1's provider should be reused
  expect(provider).toBeCalledTimes(3);

  // delete a tile
  rerender({
    tiles: [{ id: "1", tile_type: "default", tile_url: "a" }],
    cesiumIonAccessToken: "a",
  });

  expect(result.current.providers).toEqual({
    "1": ["default", "a", { hoge: "a" }],
  });
  expect(result.current.updated).toBe(true);
  expect(result.current.providers["1"][2]).not.toBe(prevImageryProvider2);
  expect(provider).toBeCalledTimes(4);

  // update a tile type
  rerender({
    tiles: [{ id: "1", tile_type: "foobar", tile_url: "u" }],
    cesiumIonAccessToken: "a",
  });

  expect(result.current.providers).toEqual({
    "1": ["foobar", "u", { hoge2: "u" }],
  });
  expect(result.current.updated).toBe(true);
  expect(provider).toBeCalledTimes(4);
  expect(provider2).toBeCalledTimes(1);

  rerender({ tiles: [] });
  expect(result.current.providers).toEqual({});
});
