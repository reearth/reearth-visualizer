import { renderHook } from "@reearth/test/utils";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

import { useEditorNavigation, useSettingsNavigation } from "./navigationHooks";

const useNavigateMock: Mock = vi.fn();

vi.mock(`react-router`, async (): Promise<unknown> => {
  const actual: Record<string, unknown> = await vi.importActual(`react-router`);

  return {
    ...actual,
    useNavigate: (): Mock => useNavigateMock
  };
});

describe("useEditorNavigation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return undefined if sceneId is not provided", () => {
    const { result } = renderHook(() =>
      useEditorNavigation({ sceneId: undefined })
    );
    expect(result.current).toBeUndefined();
  });

  it("should return a navigation function if sceneId is provided", () => {
    const { result } = renderHook(() =>
      useEditorNavigation({ sceneId: "scene-123" })
    );
    expect(typeof result.current).toBe("function");
  });

  it("should navigate to the correct URL when the function is called", () => {
    const { result } = renderHook(() =>
      useEditorNavigation({ sceneId: "scene-123" })
    );
    const navigateFunction = result.current;

    expect(navigateFunction).toBeDefined();
    if (navigateFunction) {
      navigateFunction("story");
      expect(useNavigateMock).toHaveBeenCalledWith("/scene/scene-123/story");
    }
  });

  it("should not navigate if sceneId is not provided", () => {
    const { result } = renderHook(() =>
      useEditorNavigation({ sceneId: undefined })
    );
    expect(result.current).toBeUndefined();
  });
});

describe("useSettingsNavigation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return undefined if projectId is not provided", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: undefined })
    );
    expect(result.current).toBeUndefined();
  });

  it("should return a navigation function if projectId is provided", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: "project-123" })
    );
    expect(typeof result.current).toBe("function");
  });

  it("should navigate to the correct URL when the function is called with just the page", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: "project-123" })
    );
    const navigateFunction = result.current;

    expect(navigateFunction).toBeDefined();
    if (navigateFunction) {
      navigateFunction("public");
      expect(useNavigateMock).toHaveBeenCalledWith(
        "/settings/projects/project-123/public"
      );
    }
  });

  it("should navigate to the correct URL when the function is called with page and subId", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: "project-123" })
    );
    const navigateFunction = result.current;

    expect(navigateFunction).toBeDefined();
    if (navigateFunction) {
      navigateFunction("plugin", "plugin-456");
      expect(useNavigateMock).toHaveBeenCalledWith(
        "/settings/projects/project-123/plugin/plugin-456"
      );
    }
  });

  it("should not navigate if page is not provided", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: "project-123" })
    );
    const navigateFunction = result.current;

    expect(navigateFunction).toBeDefined();
    if (navigateFunction) {
      navigateFunction(undefined);
      expect(useNavigateMock).not.toHaveBeenCalled();
    }
  });

  it("should not navigate if projectId is not provided", () => {
    const { result } = renderHook(() =>
      useSettingsNavigation({ projectId: undefined })
    );
    expect(result.current).toBeUndefined();
  });
});
