import { STREET_VIEW_WIDGET_ID } from "@reearth/services/api/widget";
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useHooks from "./hooks";

const addWidget = vi.fn();
const removeWidget = vi.fn();
const addSystemTile = vi.fn();
const removeSystemTile = vi.fn();

const installedGSSVWidget = {
  id: "installed-widget-id",
  pluginId: "reearth",
  extensionId: "streetView",
  property: { id: "property-id" }
};
let installedWidgets: (typeof installedGSSVWidget)[] = [];

vi.mock("@reearth/app/utils/value", () => ({
  toWidgetAlignSystemType: () => "OUTER"
}));

vi.mock("@reearth/services/api/widget", () => ({
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID: "reearth/googleMapSearch",
  STREET_VIEW_WIDGET_ID: "reearth/streetView",
  useInstallableWidgets: () => ({ installableWidgets: [] }),
  useInstalledWidgets: () => ({
    get installedWidgets() {
      return installedWidgets;
    }
  }),
  useWidgetMutations: () => ({ addWidget, removeWidget })
}));

vi.mock("./useSystemTile", () => ({
  useSystemTile: () => ({ addSystemTile, removeSystemTile })
}));

vi.mock("../../atoms", () => ({
  useWidgetsViewDevice: () => [undefined]
}));

const selectWidget = vi.fn();

describe("WidgetManagerPanel hooks", () => {
  beforeEach(() => {
    addWidget.mockReset();
    removeWidget.mockReset();
    addSystemTile.mockReset();
    removeSystemTile.mockReset();
    selectWidget.mockReset();
    installedWidgets = [];
  });

  it("does not create the system tile when addWidget fails (REL-05)", async () => {
    addWidget.mockResolvedValue({ status: "error" });
    const { result } = renderHook(() =>
      useHooks({ sceneId: "scene-id", selectWidget })
    );

    await act(async () => {
      await result.current.handleWidgetAdd(STREET_VIEW_WIDGET_ID);
    });

    expect(addWidget).toHaveBeenCalled();
    expect(addSystemTile).not.toHaveBeenCalled();
  });

  it("creates the system tile when addWidget succeeds", async () => {
    addWidget.mockResolvedValue({ status: "success" });
    const { result } = renderHook(() =>
      useHooks({ sceneId: "scene-id", selectWidget })
    );

    await act(async () => {
      await result.current.handleWidgetAdd(STREET_VIEW_WIDGET_ID);
    });

    expect(addSystemTile).toHaveBeenCalled();
  });

  it("does not remove the system tile when removeWidget fails (REL-06)", async () => {
    installedWidgets = [installedGSSVWidget];
    removeWidget.mockResolvedValue({ status: "error" });
    const { result } = renderHook(() =>
      useHooks({ sceneId: "scene-id", selectWidget })
    );

    await act(async () => {
      await result.current.handleWidgetRemove("installed-widget-id");
    });

    expect(removeWidget).toHaveBeenCalled();
    expect(removeSystemTile).not.toHaveBeenCalled();
  });

  it("removes the system tile when removeWidget succeeds", async () => {
    installedWidgets = [installedGSSVWidget];
    removeWidget.mockResolvedValue({ status: "success" });
    const { result } = renderHook(() =>
      useHooks({ sceneId: "scene-id", selectWidget })
    );

    await act(async () => {
      await result.current.handleWidgetRemove("installed-widget-id");
    });

    expect(removeSystemTile).toHaveBeenCalled();
  });
});
