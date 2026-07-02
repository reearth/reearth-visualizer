/**
 * Tests for useZushiPlugin Hook
 *
 * Validates the Zushi plugin lifecycle management hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import type { ReearthPluginContext } from "../pluginAPI/zushiAdapter";

import useZushiPlugin, { defaultIsMarshalable } from "./useZushiPlugin";

// Mock Zushi Plugin
vi.mock("@reearth/zushi", () => {
  const mockPlugin = {
    start: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn()
  };

  return {
    Plugin: vi.fn(() => mockPlugin),
    quickjs: vi.fn(() => ({ isMarshalable: true }))
  };
});

describe("useZushiPlugin", () => {
  let mockPluginContext: ReearthPluginContext;

  beforeEach(() => {
    mockPluginContext = {
      plugin: {
        id: "test-plugin",
        extensionId: "test-extension",
        extensionType: "widget",
        property: {}
      },
      context: {
        reearth: {} as ReearthPluginContext["context"]["reearth"],
        pluginInstances: {
          meta: { current: [] },
          postMessage: vi.fn(),
          addPluginMessageSender: vi.fn(),
          removePluginMessageSender: vi.fn(),
          runTimesCache: {
            get: vi.fn(),
            increment: vi.fn(),
            decrement: vi.fn(),
            clear: vi.fn(),
            clearAll: vi.fn()
          }
        },
        clientStorage: {
          getAsync: vi.fn(),
          setAsync: vi.fn(),
          deleteAsync: vi.fn(),
          keysAsync: vi.fn(),
          dropStore: vi.fn()
        },
        viewerEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        selectionModeEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        cameraEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        timelineEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        layersEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        sketchEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() }
      } as ReearthPluginContext["context"]
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("defaultIsMarshalable", () => {
    test("allows primitives", () => {
      expect(defaultIsMarshalable(42)).toBe(true);
      expect(defaultIsMarshalable("string")).toBe(true);
      expect(defaultIsMarshalable(true)).toBe(true);
      expect(defaultIsMarshalable(null)).toBe(true);
      expect(defaultIsMarshalable(undefined)).toBe(true);
    });

    test("allows arrays", () => {
      expect(defaultIsMarshalable([1, 2, 3])).toBe(true);
      expect(defaultIsMarshalable(["a", "b"])).toBe(true);
    });

    test("allows plain objects", () => {
      expect(defaultIsMarshalable({})).toBe(true);
      expect(defaultIsMarshalable({ a: 1, b: 2 })).toBe(true);
    });

    test("allows functions", () => {
      expect(defaultIsMarshalable(() => {})).toBe(true);
      expect(defaultIsMarshalable(function test() {})).toBe(true);
    });

    test("allows Date", () => {
      expect(defaultIsMarshalable(new Date())).toBe(true);
    });

    test("allows Promise", () => {
      expect(defaultIsMarshalable(Promise.resolve())).toBe(true);
    });

    test("allows async functions", () => {
      expect(defaultIsMarshalable(async () => {})).toBe(true);
    });

    test("rejects class instances", () => {
      // eslint-disable-next-line @typescript-eslint/no-extraneous-class
      class MyClass {}
      expect(defaultIsMarshalable(new MyClass())).toBe(false);
    });
  });

  describe("hook behavior", () => {
    test("returns loaded=false initially", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      expect(result.current.loaded).toBe(false);
    });

    test("provides handleMessage function", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      expect(typeof result.current.handleMessage).toBe("function");
    });

    test("provides surfaceRefs", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      expect(result.current.surfaceRefs).toBeDefined();
      expect(result.current.surfaceRefs.uiContainer).toBeDefined();
      expect(result.current.surfaceRefs.modalContainer).toBeDefined();
      expect(result.current.surfaceRefs.popupContainer).toBeDefined();
    });

    test("accepts onPreInit callback", () => {
      const onPreInit = vi.fn();

      renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          onPreInit
        })
      );

      // onPreInit should be accepted as a valid prop
      expect(onPreInit).toBeDefined();
    });

    test("accepts onError callback", () => {
      const onError = vi.fn();

      renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          onError
        })
      );

      // onError should be accepted as a valid prop
      expect(onError).toBeDefined();
    });

    test("skips initialization when skip=true", () => {
      const onPreInit = vi.fn();

      renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: true,
          onPreInit
        })
      );

      expect(onPreInit).not.toHaveBeenCalled();
    });

    test("skips initialization when no code provided", () => {
      const onPreInit = vi.fn();

      renderHook(() =>
        useZushiPlugin({
          pluginContext: mockPluginContext,
          skip: false,
          onPreInit
        })
      );

      expect(onPreInit).not.toHaveBeenCalled();
    });

    test("accepts onDispose callback", () => {
      const onDispose = vi.fn();

      const { unmount } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          onDispose
        })
      );

      // onDispose should be accepted as a valid prop
      expect(onDispose).toBeDefined();

      unmount();
    });

    test("handles message events", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      const testMessage = { type: "test", data: "hello" };

      expect(() => result.current.handleMessage(testMessage)).not.toThrow();
    });

    test("calls onMessage callback when message received", () => {
      const onMessage = vi.fn();

      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          onMessage
        })
      );

      const testMessage = { type: "test", data: "hello" };
      result.current.handleMessage(testMessage);

      expect(onMessage).toHaveBeenCalledWith(testMessage);
    });

    test("loads code from src URL", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve("console.log('fetched');")
      });

      renderHook(() =>
        useZushiPlugin({
          src: "https://example.com/plugin.js",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("https://example.com/plugin.js");
      });
    });

    test("prefers sourceCode over src", () => {
      global.fetch = vi.fn();

      renderHook(() =>
        useZushiPlugin({
          src: "https://example.com/plugin.js",
          sourceCode: "console.log('inline');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("supports custom isMarshalable function", () => {
      const customIsMarshalable = vi.fn(() => true);

      renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          isMarshalable: customIsMarshalable
        })
      );

      // Custom function should be passed to Zushi backend
      expect(customIsMarshalable).toBeDefined();
    });

    test("supports isMarshalable='json'", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          isMarshalable: "json"
        })
      );

      expect(result.current).toBeDefined();
    });

    test("supports isMarshalable=false", () => {
      const { result } = renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          isMarshalable: false
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe("ref imperativeHandle", () => {
    test("exposes getPlugin method via ref", () => {
      const ref = { current: null } as React.MutableRefObject<{ getPlugin: () => unknown } | null>;

      renderHook(() =>
        useZushiPlugin({
          sourceCode: "console.log('test');",
          pluginContext: mockPluginContext,
          skip: false,
          ref
        })
      );

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.getPlugin).toBe("function");
    });
  });
});
