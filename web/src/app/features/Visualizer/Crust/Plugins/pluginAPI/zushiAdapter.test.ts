/**
 * Tests for Zushi Adapter
 *
 * Validates the bridge between Zushi's surface API and Re:Earth's plugin API
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SurfaceAPI } from "@reearth/zushi";
import { describe, expect, test, vi } from "vitest";

import type { Context } from "../types";

import {
  createZushiExposedAPI,
  type ExternalCloseRefs,
  type ReearthPluginContext
} from "./zushiAdapter";

// Mock SurfaceAPI
function createMockSurface(): SurfaceAPI {
  return {
    show: vi.fn(),
    update: vi.fn(),
    setVisible: vi.fn(),
    postMessage: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  } as unknown as SurfaceAPI;
}

// Mock ReearthPluginContext
function createMockReearthContext(): ReearthPluginContext {
  return {
    plugin: {
      id: "test-plugin",
      extensionId: "test-extension",
      extensionType: "widget",
      property: { testProp: "value" }
    },
    context: {
      reearth: {
        version: "1.0.0",
        apiVersion: "2.1.0",
        engine: "Cesium",
        viewer: {
          tools: {},
          interactionMode: {},
          property: {},
          flyTo: vi.fn(),
          lookAt: vi.fn()
        } as any,
        camera: {
          position: {},
          viewport: {},
          flyTo: vi.fn()
        } as any,
        layers: {
          layers: [],
          add: vi.fn(),
          delete: vi.fn(),
          show: vi.fn(),
          hide: vi.fn()
        } as any,
        timeline: {
          current: "",
          start: "",
          stop: "",
          play: vi.fn(),
          pause: vi.fn()
        } as any,
        sketch: {
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn()
        } as any,
        spatialId: {} as any,
        extension: {
          on: vi.fn(),
          off: vi.fn(),
          once: vi.fn()
        } as any,
        data: {} as any
      },
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
      viewerEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      selectionModeEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      cameraEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      timelineEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      layersEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      sketchEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      },
      spatialIdEvents: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn()
      }
    } as unknown as Context
  };
}

describe("zushiAdapter", () => {
  describe("createZushiExposedAPI", () => {
    test("creates exposed API factory function", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      expect(typeof factory).toBe("function");
    });

    test("factory returns GlobalThis object with reearth property", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      expect(globalThis).toHaveProperty("reearth");
      expect(globalThis).toHaveProperty("console");
    });

    test("maps UI surface to reearth.ui API", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const uiSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: uiSurface,
          modal: createMockSurface(),
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      // Test UI show
      globalThis.reearth.ui.show("<div>test</div>", {
        width: 300,
        height: 400
      });
      expect(uiSurface.show).toHaveBeenCalledWith("<div>test</div>", {
        width: 300,
        height: 400,
        visible: true
      });

      // Test UI postMessage
      globalThis.reearth.ui.postMessage({ type: "test", data: "message" });
      expect(uiSurface.postMessage).toHaveBeenCalledWith({
        type: "test",
        data: "message"
      });

      // Test UI close
      globalThis.reearth.ui.close();
      expect(uiSurface.setVisible).toHaveBeenCalledWith(false);
    });

    test("maps Modal surface to reearth.modal API", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      // Test modal show
      globalThis.reearth.modal.show("<div>modal content</div>", {
        width: "50%",
        height: 500
      });
      expect(modalSurface.show).toHaveBeenCalledWith(
        "<div>modal content</div>",
        {
          width: "50%",
          height: 500,
          visible: true
        }
      );

      // Test modal close
      globalThis.reearth.modal.close();
      expect(modalSurface.setVisible).toHaveBeenCalledWith(false);

      // Test modal postMessage
      globalThis.reearth.modal.postMessage({ action: "update" });
      expect(modalSurface.postMessage).toHaveBeenCalledWith({
        action: "update"
      });
    });

    test("modal.update updates dimensions and triggers onModalShow callback", () => {
      const onModalShow = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onModalShow
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Test modal.update with background and clickBgToClose
      globalThis.reearth.modal.update({
        width: 600,
        height: 400,
        background: "#ff0000",
        clickBgToClose: true
      });

      // Verify surface.update was called with dimensions
      expect(modalSurface.update).toHaveBeenCalledWith({
        width: 600,
        height: 400
      });

      // Verify onModalShow was called with background options
      expect(onModalShow).toHaveBeenCalledWith({
        background: "#ff0000",
        clickBgToClose: true
      });
    });

    test("maps Popup surface to reearth.popup API", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        }
      };

      const globalThis = factory(mockZushiContext as any);

      // Test popup show
      globalThis.reearth.popup.show("<div>popup</div>", {
        width: 200,
        height: 100
      });
      expect(popupSurface.show).toHaveBeenCalledWith("<div>popup</div>", {
        width: 200,
        height: 100,
        visible: true
      });

      // Test popup close
      globalThis.reearth.popup.close();
      expect(popupSurface.setVisible).toHaveBeenCalledWith(false);
    });

    test("passes through plugin context correctly", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      // Verify reearth object has core properties
      expect(globalThis.reearth.version).toBeDefined();
      expect(globalThis.reearth.apiVersion).toBeDefined();
      expect(globalThis.reearth.viewer).toBeDefined();
      expect(globalThis.reearth.camera).toBeDefined();
      expect(globalThis.reearth.layers).toBeDefined();
    });

    test("handles message event system", () => {
      const reearthContext = createMockReearthContext();
      const onMessage = vi.fn();
      const offMessage = vi.fn();
      const onceMessage = vi.fn();

      const messageHandlers = {
        onMessage,
        offMessage,
        onceMessage,
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      // Test extension message events
      const testCallback = () => {};
      globalThis.reearth.extension.on("message", testCallback);
      expect(onMessage).toHaveBeenCalledWith(testCallback);

      globalThis.reearth.extension.off("message", testCallback);
      expect(offMessage).toHaveBeenCalledWith(testCallback);
    });

    test("subscribes to built-in surface message events and forwards them", () => {
      const reearthContext = createMockReearthContext();
      const dispatchMessage = vi.fn();

      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      // Capture the callbacks registered for each surface's "message" event
      const messageSubscribers: Record<string, Set<(msg: unknown) => void>> = {
        ui: new Set(),
        modal: new Set(),
        popup: new Set()
      };
      const createSurface = (name: "ui" | "modal" | "popup") => ({
        show: vi.fn(),
        update: vi.fn(),
        setVisible: vi.fn(),
        postMessage: vi.fn(),
        close: vi.fn(),
        on: vi.fn((type: string, cb: (msg: unknown) => void) => {
          if (type === "message") messageSubscribers[name].add(cb);
          return () => {};
        }),
        off: vi.fn()
      });

      const mockZushiContext = {
        surfaces: {
          ui: createSurface("ui"),
          modal: createSurface("modal"),
          popup: createSurface("popup")
        }
      };

      factory(mockZushiContext as any);

      // All three surfaces must be subscribed to their built-in "message" event
      for (const name of ["ui", "modal", "popup"] as const) {
        expect(messageSubscribers[name].size).toBe(1);
      }

      // Emitting a message on any surface must forward to dispatchMessage
      const testMessage = { type: "myMessage", value: 1 };
      messageSubscribers.ui.forEach((cb) => cb(testMessage));
      expect(dispatchMessage).toHaveBeenCalledWith(testMessage);
    });

    test("provides console access", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        }
      };

      const globalThis = factory(mockZushiContext as any);

      expect(globalThis.console).toBeDefined();
      expect(globalThis.console.log).toBe(console.log);
      expect(globalThis.console.error).toBe(console.error);
    });

    test("wraps async viewer.tools methods to trigger event loop", async () => {
      const startEventLoop = vi.fn();
      const getCurrentLocationAsync = vi.fn().mockResolvedValue({
        lat: 35.6762,
        lng: 139.6503,
        height: 0
      });
      const getTerrainHeightAsync = vi.fn().mockResolvedValue(100);
      const getGeoidHeight = vi.fn().mockResolvedValue(50);

      const reearthContext = {
        ...createMockReearthContext(),
        context: {
          ...createMockReearthContext().context,
          reearth: {
            ...createMockReearthContext().context.reearth,
            viewer: {
              ...createMockReearthContext().context.reearth.viewer,
              tools: {
                ...createMockReearthContext().context.reearth.viewer.tools,
                getCurrentLocationAsync,
                getTerrainHeightAsync,
                getGeoidHeight
              }
            }
          }
        }
      };

      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        },
        startEventLoop
      };

      const globalThis = factory(mockZushiContext as any);

      // Test getCurrentLocationAsync triggers event loop
      await globalThis.reearth.viewer.tools.getCurrentLocationAsync();
      expect(getCurrentLocationAsync).toHaveBeenCalled();
      expect(startEventLoop).toHaveBeenCalled();

      // Reset and test getTerrainHeightAsync
      startEventLoop.mockClear();
      await globalThis.reearth.viewer.tools.getTerrainHeightAsync(
        139.6503,
        35.6762
      );
      expect(getTerrainHeightAsync).toHaveBeenCalledWith(139.6503, 35.6762);
      expect(startEventLoop).toHaveBeenCalled();

      // Reset and test getGeoidHeight
      startEventLoop.mockClear();
      await globalThis.reearth.viewer.tools.getGeoidHeight(139.6503, 35.6762);
      expect(getGeoidHeight).toHaveBeenCalledWith(139.6503, 35.6762);
      expect(startEventLoop).toHaveBeenCalled();
    });

    test("wraps async viewer.tools methods to trigger event loop on error", async () => {
      const startEventLoop = vi.fn();
      const getCurrentLocationAsync = vi
        .fn()
        .mockRejectedValue(new Error("Location unavailable"));

      const reearthContext = {
        ...createMockReearthContext(),
        context: {
          ...createMockReearthContext().context,
          reearth: {
            ...createMockReearthContext().context.reearth,
            viewer: {
              ...createMockReearthContext().context.reearth.viewer,
              tools: {
                ...createMockReearthContext().context.reearth.viewer.tools,
                getCurrentLocationAsync
              }
            }
          }
        }
      };

      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: createMockSurface()
        },
        startEventLoop
      };

      const globalThis = factory(mockZushiContext as any);

      // Test that event loop is triggered even on error
      try {
        await globalThis.reearth.viewer.tools.getCurrentLocationAsync();
      } catch (_e) {
        // Expected error
      }

      expect(getCurrentLocationAsync).toHaveBeenCalled();
      expect(startEventLoop).toHaveBeenCalled();
    });

    test("modal.close() clears content with empty div", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires modal to be open)
      globalThis.reearth.modal.show("<div>test</div>", {});
      vi.mocked(modalSurface.show).mockClear();
      vi.mocked(modalSurface.setVisible).mockClear();

      // Call modal.close()
      globalThis.reearth.modal.close();

      // Verify content was cleared with empty div
      expect(modalSurface.show).toHaveBeenCalledWith("<div></div>", {});
      expect(modalSurface.setVisible).toHaveBeenCalledWith(false);
    });

    test("modal.close() calls onModalClose callback", () => {
      const onModalClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onModalClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires modal to be open)
      globalThis.reearth.modal.show("<div>test</div>", {});

      // Call modal.close()
      globalThis.reearth.modal.close();

      // Verify onModalClose was called
      expect(onModalClose).toHaveBeenCalled();
    });

    test("external modal close ref triggers close events without calling onModalClose", () => {
      const onModalClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onModalClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      // Create external close refs
      const externalCloseRefs: ExternalCloseRefs = {
        modalCloseRef: { current: null },
        popupCloseRef: { current: null }
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {},
        externalCloseRefs
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires modal to be open)
      globalThis.reearth.modal.show("<div>test</div>", {});
      vi.mocked(modalSurface.show).mockClear();
      vi.mocked(modalSurface.setVisible).mockClear();

      // Register a close event handler
      const closeHandler = vi.fn();
      globalThis.reearth.modal.on("close", closeHandler);

      // Verify external close ref was set and call it
      const externalClose = externalCloseRefs.modalCloseRef.current;
      expect(externalClose).not.toBeNull();
      if (externalClose) {
        externalClose();
      }

      // Verify surface was hidden and content was cleared
      expect(modalSurface.setVisible).toHaveBeenCalledWith(false);
      expect(modalSurface.show).toHaveBeenCalledWith("<div></div>", {});

      // Verify close event was triggered
      expect(closeHandler).toHaveBeenCalled();

      // Verify onModalClose was NOT called (critical for close-before-show pattern)
      expect(onModalClose).not.toHaveBeenCalled();
    });

    test("popup.close() clears content with empty div", () => {
      const reearthContext = createMockReearthContext();
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires popup to be open)
      globalThis.reearth.popup.show("<div>test</div>", {});
      vi.mocked(popupSurface.show).mockClear();
      vi.mocked(popupSurface.setVisible).mockClear();

      // Call popup.close()
      globalThis.reearth.popup.close();

      // Verify content was cleared with empty div
      expect(popupSurface.show).toHaveBeenCalledWith("<div></div>", {});
      expect(popupSurface.setVisible).toHaveBeenCalledWith(false);
    });

    test("popup.close() calls onPopupClose callback", () => {
      const onPopupClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onPopupClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires popup to be open)
      globalThis.reearth.popup.show("<div>test</div>", {});

      // Call popup.close()
      globalThis.reearth.popup.close();

      // Verify onPopupClose was called
      expect(onPopupClose).toHaveBeenCalled();
    });

    test("external popup close ref triggers close events without calling onPopupClose", () => {
      const onPopupClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onPopupClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      // Create external close refs
      const externalCloseRefs: ExternalCloseRefs = {
        modalCloseRef: { current: null },
        popupCloseRef: { current: null }
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {},
        externalCloseRefs
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Must show first (idempotent guard requires popup to be open)
      globalThis.reearth.popup.show("<div>test</div>", {});
      vi.mocked(popupSurface.show).mockClear();
      vi.mocked(popupSurface.setVisible).mockClear();

      // Register a close event handler
      const closeHandler = vi.fn();
      globalThis.reearth.popup.on("close", closeHandler);

      // Verify external close ref was set and call it
      const externalClose = externalCloseRefs.popupCloseRef.current;
      expect(externalClose).not.toBeNull();
      if (externalClose) {
        externalClose();
      }

      // Verify surface was hidden and content was cleared
      expect(popupSurface.setVisible).toHaveBeenCalledWith(false);
      expect(popupSurface.show).toHaveBeenCalledWith("<div></div>", {});

      // Verify close event was triggered
      expect(closeHandler).toHaveBeenCalled();

      // Verify onPopupClose was NOT called (critical for close-before-show pattern)
      expect(onPopupClose).not.toHaveBeenCalled();
    });

    test("modal.close() is idempotent - calling twice does not fire events twice", () => {
      const onModalClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onModalClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Show modal first
      globalThis.reearth.modal.show("<div>test</div>", {});

      // Register close handler
      const closeHandler = vi.fn();
      globalThis.reearth.modal.on("close", closeHandler);

      // Close twice
      globalThis.reearth.modal.close();
      globalThis.reearth.modal.close();

      // Verify close handler and onModalClose only called once
      expect(closeHandler).toHaveBeenCalledTimes(1);
      expect(onModalClose).toHaveBeenCalledTimes(1);
    });

    test("modal.close() after external close does not call onModalClose", () => {
      const onModalClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onModalClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const externalCloseRefs: ExternalCloseRefs = {
        modalCloseRef: { current: null },
        popupCloseRef: { current: null }
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {},
        externalCloseRefs
      );

      const modalSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: modalSurface,
          popup: createMockSurface()
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Show modal first
      globalThis.reearth.modal.show("<div>test</div>", {});

      // Register close handler
      const closeHandler = vi.fn();
      globalThis.reearth.modal.on("close", closeHandler);

      // External close (simulating another plugin taking over)
      const externalClose = externalCloseRefs.modalCloseRef.current;
      if (externalClose) {
        externalClose();
      }

      // Plugin A tries to close its modal (unaware it was externally closed)
      globalThis.reearth.modal.close();

      // Verify close handler fired once (from external close)
      expect(closeHandler).toHaveBeenCalledTimes(1);
      // Verify onModalClose was never called (external close skips it, subsequent close is guarded)
      expect(onModalClose).not.toHaveBeenCalled();
    });

    test("popup.close() is idempotent - calling twice does not fire events twice", () => {
      const onPopupClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onPopupClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {}
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Show popup first
      globalThis.reearth.popup.show("<div>test</div>", {});

      // Register close handler
      const closeHandler = vi.fn();
      globalThis.reearth.popup.on("close", closeHandler);

      // Close twice
      globalThis.reearth.popup.close();
      globalThis.reearth.popup.close();

      // Verify close handler and onPopupClose only called once
      expect(closeHandler).toHaveBeenCalledTimes(1);
      expect(onPopupClose).toHaveBeenCalledTimes(1);
    });

    test("popup.close() after external close does not call onPopupClose", () => {
      const onPopupClose = vi.fn();
      const reearthContext = {
        ...createMockReearthContext(),
        onPopupClose
      };
      const messageHandlers = {
        onMessage: vi.fn(),
        offMessage: vi.fn(),
        onceMessage: vi.fn(),
        dispatchMessage: vi.fn()
      };

      const externalCloseRefs: ExternalCloseRefs = {
        modalCloseRef: { current: null },
        popupCloseRef: { current: null }
      };

      const factory = createZushiExposedAPI(
        () => reearthContext,
        messageHandlers,
        () => {},
        externalCloseRefs
      );

      const popupSurface = createMockSurface();
      const mockZushiContext = {
        surfaces: {
          ui: createMockSurface(),
          modal: createMockSurface(),
          popup: popupSurface
        },
        startEventLoop: vi.fn()
      };

      const globalThis = factory(mockZushiContext as any);

      // Show popup first
      globalThis.reearth.popup.show("<div>test</div>", {});

      // Register close handler
      const closeHandler = vi.fn();
      globalThis.reearth.popup.on("close", closeHandler);

      // External close (simulating another plugin taking over)
      const externalClose = externalCloseRefs.popupCloseRef.current;
      if (externalClose) {
        externalClose();
      }

      // Plugin A tries to close its popup (unaware it was externally closed)
      globalThis.reearth.popup.close();

      // Verify close handler fired once (from external close)
      expect(closeHandler).toHaveBeenCalledTimes(1);
      // Verify onPopupClose was never called (external close skips it, subsequent close is guarded)
      expect(onPopupClose).not.toHaveBeenCalled();
    });
  });
});
