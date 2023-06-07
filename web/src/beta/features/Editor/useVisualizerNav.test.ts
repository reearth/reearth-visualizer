import { renderHook } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { Tab } from "@reearth/beta/features/Navbar";

import useVisualizerNav from "./useVisualizerNav";

describe("useLeftPanel", () => {
  (["widgets", "publish"] satisfies Tab[]).forEach(tab => {
    test(`should return content when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useVisualizerNav({
          tab,
        }),
      );
      expect(result.current.visualizerNav).toBeTruthy();
    });
  });

  (["scene", "story"] satisfies Tab[]).forEach(tab => {
    test(`should return undefined when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useVisualizerNav({
          tab,
        }),
      );
      expect(result.current.visualizerNav).toBeUndefined();
    });
  });
});
