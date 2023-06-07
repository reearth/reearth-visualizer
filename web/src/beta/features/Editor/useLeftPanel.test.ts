import { renderHook } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { Tab } from "@reearth/beta/features/Navbar";

import useLeftPanel from "./useLeftPanel";

describe("useLeftPanel", () => {
  (["story", "scene"] satisfies Tab[]).forEach(tab => {
    test(`should return content when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useLeftPanel({
          tab,
        }),
      );
      expect(result.current.leftPanel).toBeTruthy();
    });
  });

  (["publish", "widgets"] satisfies Tab[]).forEach(tab => {
    test(`should return undefined when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useLeftPanel({
          tab,
        }),
      );
      expect(result.current.leftPanel).toBeUndefined();
    });
  });
});
