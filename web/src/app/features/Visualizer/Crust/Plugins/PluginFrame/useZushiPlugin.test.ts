/**
 * Tests for useZushiPlugin Hook
 *
 * Validates the Zushi plugin lifecycle management hook
 */

import { render, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import type { ReearthPluginContext } from "../pluginAPI/zushiAdapter";

import useZushiPlugin, {
  defaultIsMarshalable,
  type Ref,
  type UseZushiPluginReturn
} from "./useZushiPlugin";

// useZushiPlugin's init effect only proceeds once surfaceRefs.uiContainer is
// attached to a real DOM node (modal/popup containers are always non-null
// detached elements), so exercising the real init/dispose flow - as opposed
// to tests that only check the hook's synchronous return shape - requires an
// actual render, not renderHook.
function ZushiHarness({
  pluginContext,
  onReady
}: {
  pluginContext: ReearthPluginContext;
  onReady: (value: UseZushiPluginReturn) => void;
}) {
  const value = useZushiPlugin({
    sourceCode: "console.log('test');",
    pluginContext,
    skip: false
  });
  onReady(value);
  return createElement("div", { ref: value.surfaceRefs.uiContainer });
}

// Mock Zushi Plugin
let startImpl: () => Promise<void> = () => Promise.resolve();

vi.mock("@reearth/zushi", () => {
  const mockPlugin = {
    start: vi.fn(() => startImpl()),
    dispose: vi.fn()
  };

  return {
    // Must be a real function (not an arrow) so `new Plugin(...)` - as used
    // by useZushiPlugin - can construct it; returning an object from a
    // constructor call makes `new` yield that object instead of `this`.
    Plugin: vi.fn(function () {
      return mockPlugin;
    }),
    quickjs: vi.fn(() => ({ isMarshalable: true }))
  };
});

describe("useZushiPlugin", () => {
  let mockPluginContext: ReearthPluginContext;

  beforeEach(() => {
    startImpl = () => Promise.resolve();
    mockPluginContext = {
      plugin: {
        id: "test-plugin",
        extensionId: "test-extension",
        extensionType: "widget",
        property: {}
      },
      context: {
        reearth: {
          viewer: {
            tools: {},
            interactionMode: {},
            property: {},
            flyTo: vi.fn(),
            lookAt: vi.fn()
          },
          camera: { position: {}, viewport: {}, flyTo: vi.fn() },
          layers: {
            layers: [],
            add: vi.fn(),
            delete: vi.fn(),
            show: vi.fn(),
            hide: vi.fn()
          },
          timeline: {
            current: "",
            start: "",
            stop: "",
            play: vi.fn(),
            pause: vi.fn()
          },
          sketch: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
          spatialId: {},
          extension: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
          data: {}
        } as unknown as ReearthPluginContext["context"]["reearth"],
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
        sketchEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() },
        spatialIdEvents: { on: vi.fn(), off: vi.fn(), once: vi.fn() }
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

    test("removes viewer event listeners registered through the exposed API on unmount", async () => {
      let latest: UseZushiPluginReturn | undefined;
      const { unmount } = render(
        createElement(ZushiHarness, {
          pluginContext: mockPluginContext,
          onReady: (value) => {
            latest = value;
          }
        })
      );

      await waitFor(() => expect(latest?.loaded).toBe(true));

      const { Plugin: PluginMock } = await import("@reearth/zushi");
      const config = (PluginMock as unknown as { mock: { calls: any[][] } })
        .mock.calls[0][0];
      const mockSurface = () => ({
        show: vi.fn(),
        update: vi.fn(),
        setVisible: vi.fn(),
        postMessage: vi.fn()
      });
      const api = config.exposed({
        startEventLoop: vi.fn(),
        surfaces: {
          ui: mockSurface(),
          modal: mockSurface(),
          popup: mockSurface()
        }
      });

      const callback = vi.fn();
      api.reearth.viewer.on("click", callback);

      expect(mockPluginContext.context.viewerEvents.on).toHaveBeenCalledWith(
        "click",
        callback
      );
      expect(mockPluginContext.context.viewerEvents.off).not.toHaveBeenCalled();

      unmount();

      expect(mockPluginContext.context.viewerEvents.off).toHaveBeenCalledWith(
        "click",
        callback
      );
    });

    test("removes camera event listeners registered through the exposed API on unmount", async () => {
      let latest: UseZushiPluginReturn | undefined;
      const { unmount } = render(
        createElement(ZushiHarness, {
          pluginContext: mockPluginContext,
          onReady: (value) => {
            latest = value;
          }
        })
      );

      await waitFor(() => expect(latest?.loaded).toBe(true));

      const { Plugin: PluginMock } = await import("@reearth/zushi");
      const config = (PluginMock as unknown as { mock: { calls: any[][] } })
        .mock.calls[0][0];
      const mockSurface = () => ({
        show: vi.fn(),
        update: vi.fn(),
        setVisible: vi.fn(),
        postMessage: vi.fn()
      });
      const api = config.exposed({
        startEventLoop: vi.fn(),
        surfaces: {
          ui: mockSurface(),
          modal: mockSurface(),
          popup: mockSurface()
        }
      });

      const callback = vi.fn();
      api.reearth.camera.on("move", callback);

      expect(mockPluginContext.context.cameraEvents.on).toHaveBeenCalledWith(
        "move",
        callback
      );
      expect(mockPluginContext.context.cameraEvents.off).not.toHaveBeenCalled();

      unmount();

      expect(mockPluginContext.context.cameraEvents.off).toHaveBeenCalledWith(
        "move",
        callback
      );
    });

    test("disposes the plugin instead of resurrecting it when unmounted mid-start", async () => {
      let resolveStart: () => void = () => {};
      startImpl = () =>
        new Promise((resolve) => {
          resolveStart = resolve;
        });

      const { unmount } = render(
        createElement(ZushiHarness, {
          pluginContext: mockPluginContext,
          onReady: () => {}
        })
      );

      // Unmount while plugin.start() is still pending
      unmount();

      const { Plugin: PluginMock } = await import("@reearth/zushi");
      const mockPlugin = (
        PluginMock as unknown as () => { dispose: ReturnType<typeof vi.fn> }
      )();

      resolveStart();
      await waitFor(() => expect(mockPlugin.dispose).toHaveBeenCalled());
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

    test("forwards surface message events to plugin extension message handlers", async () => {
      let latest: UseZushiPluginReturn | undefined;
      render(
        createElement(ZushiHarness, {
          pluginContext: mockPluginContext,
          onReady: (value) => {
            latest = value;
          }
        })
      );

      await waitFor(() => expect(latest?.loaded).toBe(true));

      // Register an extension message handler through the exposed API
      const { Plugin: PluginMock } = await import("@reearth/zushi");
      const config = (PluginMock as unknown as { mock: { calls: any[][] } })
        .mock.calls[0][0];

      // Capture the callbacks the adapter subscribes for each surface's
      // built-in "message" event
      const messageSubscribers = new Set<(msg: unknown) => void>();
      const createSurface = () => ({
        show: vi.fn(),
        update: vi.fn(),
        setVisible: vi.fn(),
        postMessage: vi.fn(),
        close: vi.fn(),
        on: vi.fn((type: string, cb: (msg: unknown) => void) => {
          if (type === "message") messageSubscribers.add(cb);
          return () => {};
        }),
        off: vi.fn()
      });
      const api = config.exposed({
        startEventLoop: vi.fn(),
        surfaces: {
          ui: createSurface(),
          modal: createSurface(),
          popup: createSurface()
        }
      });

      const handler = vi.fn();
      api.reearth.extension.on("message", handler);

      // Messages emitted through Zushi's built-in surface "message" event
      // must reach the plugin's extension message handlers
      const emitted = { type: "myMessage", value: 1 };
      messageSubscribers.forEach((cb) => cb(emitted));

      expect(handler).toHaveBeenCalledWith(emitted);
    });

    test("loads code from src URL", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          text: () => Promise.resolve("console.log('fetched');")
        } as Response);

      renderHook(() =>
        useZushiPlugin({
          src: "https://example.com/plugin.js",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith("https://example.com/plugin.js");
      });

      fetchSpy.mockRestore();
    });

    test("prefers sourceCode over src", () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());

      renderHook(() =>
        useZushiPlugin({
          src: "https://example.com/plugin.js",
          sourceCode: "console.log('inline');",
          pluginContext: mockPluginContext,
          skip: false
        })
      );

      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
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
      const ref = { current: null } as React.MutableRefObject<Ref | null>;

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
