import { renderHook } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { Tab } from "@reearth/beta/features/Navbar";

import useRightPanel from "./useRightPanel";

describe("useLeftPanel", () => {
  (["story", "scene", "widgets"] satisfies Tab[]).forEach(tab => {
    test(`should return content when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useRightPanel({
          tab,
        }),
      );
      expect(result.current.rightPanel).toBeTruthy();
    });
  });

  (["publish"] satisfies Tab[]).forEach(tab => {
    test(`should return undefined when tab is ${tab}`, () => {
      const { result } = renderHook(() =>
        useRightPanel({
          tab,
        }),
      );
      expect(result.current.rightPanel).toBeUndefined();
    });
  });
});
