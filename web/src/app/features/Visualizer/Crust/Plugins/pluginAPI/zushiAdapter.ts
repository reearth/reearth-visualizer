/**
 * Zushi Adapter
 *
 * This module provides the bridge between Zushi's surface API and the current
 * Re:Earth plugin API structure. It maps Zushi surfaces (ui, modal, popup) to
 * the existing iframe-based API interface.
 *
 * CRITICAL: ASYNC METHODS REQUIREMENT
 *
 * All async methods exposed to plugins MUST trigger Zushi's event loop after
 * their promises resolve. Without this, the plugin execution freezes waiting
 * for the result.
 *
 * WHY: Zushi runs plugin code in a QuickJS WebAssembly VM. When an async
 * operation (Promise) resolves outside the VM, the VM doesn't automatically
 * resume execution. You must call startEventLoop() to pump the event queue.
 *
 * HOW TO ADD NEW ASYNC METHODS:
 *
 * 1. Identify if the method returns a Promise
 * 2. Use the wrapAsync() utility function (see below) to wrap it
 * 3. Add it to the appropriate wrapper (wrapCommonReearth, wrapClientStorage, etc.)
 *
 * Example:
 * ```typescript
 * // Adding a new async method to viewer.tools
 * function wrapCommonReearth(commonReearth, startEventLoop) {
 *   return {
 *     ...commonReearth,
 *     viewer: {
 *       ...commonReearth.viewer,
 *       tools: {
 *         ...commonReearth.viewer.tools,
 *         // Existing async methods
 *         getCurrentLocationAsync: wrapAsync(
 *           commonReearth.viewer.tools.getCurrentLocationAsync,
 *           startEventLoop
 *         ),
 *         // NEW: Your async method
 *         yourNewAsyncMethod: wrapAsync(
 *           commonReearth.viewer.tools.yourNewAsyncMethod,
 *           startEventLoop
 *         )
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * CURRENTLY WRAPPED ASYNC METHODS:
 * - clientStorage: getAsync, setAsync, deleteAsync, keysAsync, dropStore
 * - viewer.tools: getCurrentLocationAsync, getTerrainHeightAsync, getGeoidHeight
 *
 * If you add a new async method to the plugin API and forget to wrap it,
 * the symptom will be: the method works on the second call but not the first.
 */

import type { Layer } from "@reearth/core";
import type {
  SurfaceAPI,
  PluginContext as ZushiPluginContext
} from "@reearth/zushi";

import type { Widget } from "../../Widgets";
import type { PluginPopupInfo } from "../Plugin/PopupContainer";
import type { Context } from "../types";
import { copyWithOverrides } from "../utils/copyWithOverrides";
import type { Events } from "../utils/events";

import type { CommonReearth } from "./commonReearth";
import { exposedReearth } from "./exposedReearth";
import type { GlobalThis, Reearth } from "./types";

/**
 * Wraps an Events<E> emitter's on/off with per-plugin-instance tracking, so
 * every listener registered through the returned pair gets removed via
 * registerCleanup when the plugin is disposed.
 *
 * WHY: the emitters this wraps (viewerEvents, cameraEvents, timelineEvents,
 * layersEvents, sketchEvents, spatialIdEvents, selectionModeEvents) are each
 * created once per Visualizer instance, not per plugin. A plugin calling
 * e.g. `reearth.camera.on(...)` registers directly on that shared,
 * longer-lived emitter, so without this bookkeeping nothing removes the
 * listener when the plugin instance is disposed - it keeps firing into a
 * freed QuickJS runtime for the rest of the session.
 *
 * Tracks only listeners the plugin hasn't already turned off itself, so a
 * plugin that cycles on/off frequently doesn't grow this unboundedly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trackedEventPair<E extends Record<string, any[]>>(
  events: Events<E>,
  registerCleanup: (fn: () => void) => void,
  label: string
): {
  on: <T extends keyof E>(
    type: T,
    callback: (...args: E[T]) => void,
    options?: { once?: boolean }
  ) => void;
  off: <T extends keyof E>(type: T, callback: (...args: E[T]) => void) => void;
} {
  const registrations: {
    type: keyof E;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: (...args: any[]) => void;
  }[] = [];

  const on = <T extends keyof E>(
    type: T,
    callback: (...args: E[T]) => void,
    options?: { once?: boolean }
  ) => {
    registrations.push({ type, callback });
    if (options?.once) {
      events.once(type, callback);
    } else {
      events.on(type, callback);
    }
  };

  const off = <T extends keyof E>(
    type: T,
    callback: (...args: E[T]) => void
  ) => {
    events.off(type, callback);
    const index = registrations.findIndex(
      (r) => r.type === type && r.callback === callback
    );
    if (index !== -1) registrations.splice(index, 1);
  };

  registerCleanup(() => {
    while (registrations.length) {
      const registration = registrations.pop();
      if (!registration) continue;
      try {
        events.off(registration.type, registration.callback);
      } catch (err) {
        console.error(
          `[Zushi Adapter] Error removing ${label} event listener on dispose:`,
          err
        );
      }
    }
  });

  return { on, off };
}

/**
 * Re:Earth plugin context passed to the adapter
 * (Not to be confused with Zushi's PluginContext)
 */
export type ReearthPluginContext = {
  plugin?: {
    id: string;
    extensionType: string;
    extensionId: string;
    property: unknown;
  };
  context: Context;
  getWidget?: () => Widget | undefined;
  getBlock?: () => Reearth["extension"]["block"] | undefined;
  getLayer?: () => Layer | undefined;
  getUIContainerRef?: () => { current: HTMLElement | null } | undefined;
  onRender?: (type: string) => void;
  onModalShow?: (options?: {
    background?: string;
    clickBgToClose?: boolean;
  }) => void;
  onPopupShow?: (options?: PluginPopupInfo) => void;
  onModalClose?: () => void;
  onPopupClose?: () => void;
  registerPluginMessageSender?: (
    sender: (msg: { data: unknown; sender: string }) => void
  ) => void;
  unregisterPluginMessageSender?: () => void;
};

/**
 * Zushi surface map from the exposed API factory
 */
export type ZushiSurfaceMap = {
  ui: SurfaceAPI;
  modal: SurfaceAPI;
  popup: SurfaceAPI;
};

/**
 * Message event handlers for surfaces
 */
type MessageHandlers = {
  onMessage: (handler: (msg: unknown) => void) => void;
  offMessage: (handler: (msg: unknown) => void) => void;
  onceMessage: (handler: (msg: unknown) => void) => void;
};

/**
 * Close event handler manager
 * Provides on/off/once semantics for close events
 */
type CloseEventManager = {
  handlers: Set<() => void>;
  onceHandlers: Set<() => void>;
  trigger: () => void;
  on: (callback: () => void, once?: boolean) => void;
  off: (callback: () => void) => void;
};

/**
 * Manual Event Handler Management for Surface Close Events
 *
 * WHY: The Re:Earth plugin API supports event listeners with on/off/once semantics
 * for surface close events (e.g., reearth.ui.on("close", callback)).
 *
 * PROBLEM: Zushi's surface API doesn't provide built-in event management. We need
 * to implement our own event system to support the on/off/once pattern.
 *
 * SOLUTION: Manually manage two Sets of handlers:
 * - handlers: Regular listeners (persist until explicitly removed)
 * - onceHandlers: One-time listeners (automatically removed after firing)
 *
 * HOW:
 * 1. Store handlers in Sets (efficient add/remove)
 * 2. trigger() executes all handlers when surface closes
 * 3. on() adds handlers (to appropriate Set based on once flag)
 * 4. off() removes handlers from both Sets
 * 5. onceHandlers are cleared after trigger()
 *
 * This pattern is used for:
 * - UI surface close events (reearth.ui.on("close", ...))
 * - Modal surface close events (reearth.modal.on("close", ...))
 * - Popup surface close events (reearth.popup.on("close", ...))
 */
function createCloseEventManager(surfaceName: string): CloseEventManager {
  const handlers = new Set<() => void>();
  const onceHandlers = new Set<() => void>();

  return {
    handlers,
    onceHandlers,
    trigger() {
      // Execute regular handlers
      handlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error(
            `[Zushi Adapter] Error in ${surfaceName} close handler:`,
            err
          );
        }
      });
      // Execute once handlers and clear them
      onceHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error(
            `[Zushi Adapter] Error in ${surfaceName} close once handler:`,
            err
          );
        }
      });
      onceHandlers.clear();
    },
    on(callback: () => void, once = false) {
      if (once) {
        onceHandlers.add(callback);
      } else {
        handlers.add(callback);
      }
    },
    off(callback: () => void) {
      handlers.delete(callback);
      onceHandlers.delete(callback);
    }
  };
}

/**
 * Creates UI surface adapter
 */
function createUIAdapter(
  surface: SurfaceAPI,
  onRender?: (type: string) => void
): {
  show: Reearth["ui"]["show"];
  close: Reearth["ui"]["close"];
  postMessage: Reearth["ui"]["postMessage"];
  resize: Reearth["ui"]["resize"];
  on: Reearth["ui"]["on"];
  off: Reearth["ui"]["off"];
} {
  const closeEvents = createCloseEventManager("UI");

  return {
    show: (html, options) => {
      surface.setVisible(true);
      surface.show(html, {
        width: options?.width,
        height: options?.height,
        visible: options?.visible ?? true
      });
      onRender?.("ui");
    },
    close: () => {
      surface.setVisible(false);
      closeEvents.trigger();
    },
    postMessage: (msg) => {
      surface.postMessage(msg);
    },
    resize: (width, height, _extended) => {
      surface.update({
        width,
        height
        // Note: extended is not directly supported by Zushi
      });
    },
    on: (type, callback, options) => {
      if (type === "close") {
        closeEvents.on(callback as () => void, options?.once);
      }
    },
    off: (type, callback) => {
      if (type === "close") {
        closeEvents.off(callback as () => void);
      }
    }
  };
}

/**
 * Creates Modal surface adapter
 *
 * @param externalCloseRef - Optional ref to store the external close function.
 *   External close fires close events and hides surface but does NOT call
 *   onModalClose (which clears global state). Used when another plugin
 *   takes over the modal.
 */
function createModalAdapter(
  surface: SurfaceAPI,
  onRender?: (type: string) => void,
  onModalShow?: (options?: {
    background?: string;
    clickBgToClose?: boolean;
  }) => void,
  onModalClose?: () => void,
  externalCloseRef?: { current: (() => void) | null }
): {
  show: Reearth["modal"]["show"];
  close: Reearth["modal"]["close"];
  update: Reearth["modal"]["update"];
  postMessage: Reearth["modal"]["postMessage"];
  on: Reearth["modal"]["on"];
  off: Reearth["modal"]["off"];
} {
  const closeEvents = createCloseEventManager("Modal");

  /**
   * Clears surface content to ensure fresh state on next show.
   * The old implementation destroyed the iframe on close (enabled={false} returned null).
   * This mimics that behavior by clearing content, so next show() creates fresh iframe.
   */
  const clearContent = () => {
    surface.show("", {});
  };

  // Store external close function in ref so it can be called from outside
  // External close: fires close events and hides surface, but does NOT
  // call onModalClose (global state is managed by the new plugin)
  if (externalCloseRef) {
    externalCloseRef.current = () => {
      surface.setVisible(false);
      clearContent();
      closeEvents.trigger();
      // Note: onModalClose is NOT called - global state managed by new plugin
    };
  }

  return {
    show: (html, options) => {
      surface.setVisible(true);
      surface.show(html, {
        width: options?.width,
        height: options?.height,
        visible: true
      });
      onRender?.("modal");
      onModalShow?.({
        background: options?.background,
        clickBgToClose: options?.clickBgToClose
      });
    },
    close: () => {
      surface.setVisible(false);
      clearContent();
      closeEvents.trigger();
      onModalClose?.();
    },
    update: (options) => {
      surface.update({
        width: options?.width,
        height: options?.height
      });
      // Update modal wrapper background and click behavior
      onModalShow?.({
        background: options?.background,
        clickBgToClose: options?.clickBgToClose
      });
    },
    postMessage: (msg) => {
      surface.postMessage(msg);
    },
    on: (type, callback, options) => {
      if (type === "close") {
        closeEvents.on(callback as () => void, options?.once);
      }
    },
    off: (type, callback) => {
      if (type === "close") {
        closeEvents.off(callback as () => void);
      }
    }
  };
}

/**
 * Creates Popup surface adapter
 *
 * @param externalCloseRef - Optional ref to store the external close function.
 *   External close fires close events and hides surface but does NOT call
 *   onPopupClose (which clears global state). Used when another plugin
 *   takes over the popup.
 */
function createPopupAdapter(
  surface: SurfaceAPI,
  onRender?: (type: string) => void,
  onPopupShow?: (options?: PluginPopupInfo) => void,
  onPopupClose?: () => void,
  // Getters return getter functions to access latest widget/block
  getWidget?: () => (() => Widget | undefined) | undefined,
  getBlock?: () =>
    | (() => Reearth["extension"]["block"] | undefined)
    | undefined,
  getUIContainerRef?: () => { current: HTMLElement | null } | undefined,
  externalCloseRef?: { current: (() => void) | null }
): {
  show: Reearth["popup"]["show"];
  close: Reearth["popup"]["close"];
  update: Reearth["popup"]["update"];
  postMessage: Reearth["popup"]["postMessage"];
  on: Reearth["popup"]["on"];
  off: Reearth["popup"]["off"];
} {
  const closeEvents = createCloseEventManager("Popup");

  /**
   * Clears surface content to ensure fresh state on next show.
   * The old implementation destroyed the iframe on close (enabled={false} returned null).
   * This mimics that behavior by clearing content, so next show() creates fresh iframe.
   */
  const clearContent = () => {
    surface.show("", {});
  };

  // Store external close function in ref so it can be called from outside
  // External close: fires close events and hides surface, but does NOT
  // call onPopupClose (global state is managed by the new plugin)
  if (externalCloseRef) {
    externalCloseRef.current = () => {
      surface.setVisible(false);
      clearContent();
      closeEvents.trigger();
      // Note: onPopupClose is NOT called - global state managed by new plugin
    };
  }

  return {
    show: (html, options) => {
      surface.setVisible(true);
      surface.show(html, {
        width: options?.width,
        height: options?.height,
        visible: true
      });
      onRender?.("popup");

      // Get latest widget/block via double getter pattern
      const widget = getWidget?.()?.();
      const block = getBlock?.()?.();
      const uiContainerRef = getUIContainerRef?.();

      onPopupShow?.({
        id: widget?.id ?? block?.id,
        position: options?.position ?? "bottom",
        offset: options?.offset,
        ref: uiContainerRef as any
      });
    },
    close: () => {
      surface.setVisible(false);
      clearContent();
      closeEvents.trigger();
      onPopupClose?.();
    },
    update: (options) => {
      surface.update({
        width: options?.width,
        height: options?.height
      });

      // Get latest widget/block via double getter pattern
      const widget = getWidget?.()?.();
      const block = getBlock?.()?.();
      const uiContainerRef = getUIContainerRef?.();

      onPopupShow?.({
        id: widget?.id ?? block?.id,
        position: options?.position ?? "bottom",
        offset: options?.offset,
        ref: uiContainerRef as any
      });
    },
    postMessage: (msg) => {
      surface.postMessage(msg);
    },
    on: (type, callback, options) => {
      if (type === "close") {
        closeEvents.on(callback as () => void, options?.once);
      }
    },
    off: (type, callback) => {
      if (type === "close") {
        closeEvents.off(callback as () => void);
      }
    }
  };
}

/**
 * Creates extension message handler
 */
function createExtensionMessageHandler(
  context: Context,
  messageHandlers: MessageHandlers,
  startEventLoop: () => void,
  registerPluginMessageSender?: (
    sender: (msg: { data: unknown; sender: string }) => void
  ) => void
) {
  const extensionMessageHandlers = new Set<(msg: unknown) => void>();
  const extensionMessageOnceHandlers = new Set<(msg: unknown) => void>();

  // Plugin message sender - called when this plugin receives a message from another plugin
  const pluginMessageSender = (msg: { data: unknown; sender: string }) => {
    try {
      // Emit to normal handlers
      extensionMessageHandlers.forEach((handler) => {
        try {
          handler(msg);
        } catch (err) {
          console.error(
            "[Zushi Adapter] Error in extensionMessage handler:",
            err
          );
        }
      });
      // Emit to once handlers and clear them
      extensionMessageOnceHandlers.forEach((handler) => {
        try {
          handler(msg);
        } catch (err) {
          console.error(
            "[Zushi Adapter] Error in extensionMessage once handler:",
            err
          );
        }
      });
      extensionMessageOnceHandlers.clear();

      startEventLoop();
    } catch (err) {
      console.error("[Zushi Adapter] Error handling extensionMessage:", err);
    }
  };

  // Register the plugin message sender with the context
  registerPluginMessageSender?.(pluginMessageSender);

  return {
    postMessage: (id: string, msg: unknown, sender: string) => {
      context.pluginInstances.postMessage(id, msg, sender);
    },
    on: (
      type: string,
      callback: (...args: any[]) => void,
      options?: { once?: boolean }
    ) => {
      if (type === "message") {
        if (options?.once) {
          messageHandlers.onceMessage(callback as (msg: unknown) => void);
        } else {
          messageHandlers.onMessage(callback as (msg: unknown) => void);
        }
      } else if (type === "extensionMessage") {
        if (options?.once) {
          extensionMessageOnceHandlers.add(callback as (msg: unknown) => void);
        } else {
          extensionMessageHandlers.add(callback as (msg: unknown) => void);
        }
      }
    },
    off: (type: string, callback: (...args: any[]) => void) => {
      if (type === "message") {
        messageHandlers.offMessage(callback as (msg: unknown) => void);
      } else if (type === "extensionMessage") {
        extensionMessageHandlers.delete(callback as (msg: unknown) => void);
        extensionMessageOnceHandlers.delete(callback as (msg: unknown) => void);
      }
    }
  };
}

/**
 * Generic utility to wrap async functions with event loop trigger
 *
 * HOW TO USE FOR FUTURE ASYNC APIs:
 *
 * 1. Identify if a method returns a Promise
 * 2. Wrap it with wrapAsync before exposing to plugin
 * 3. The wrapper triggers startEventLoop() after resolution (success or error)
 *
 * Example:
 * ```typescript
 * const myAsyncMethod = wrapAsync(
 *   originalMethod,
 *   startEventLoop
 * );
 * ```
 *
 * @param fn - The async function to wrap
 * @param startEventLoop - Callback to trigger Zushi event loop
 * @returns Wrapped function that triggers event loop after resolution
 */
function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  startEventLoop: () => void
): T {
  return ((...args: Parameters<T>) => {
    const promise = fn(...args);
    promise.then(() => startEventLoop()).catch(() => startEventLoop());
    return promise;
  }) as T;
}

/**
 * Wraps client storage methods with event loop trigger
 *
 * IMPORTANT: All async methods in the plugin API must trigger startEventLoop()
 * after their promises resolve, otherwise the plugin execution freezes.
 *
 * See wrapAsync() utility for how to wrap new async methods.
 */
function wrapClientStorage(
  clientStorage: Context["clientStorage"],
  startEventLoop: () => void
): Context["clientStorage"] {
  return {
    ...clientStorage,
    getAsync: wrapAsync(
      clientStorage.getAsync.bind(clientStorage),
      startEventLoop
    ),
    setAsync: wrapAsync(
      clientStorage.setAsync.bind(clientStorage),
      startEventLoop
    ),
    deleteAsync: wrapAsync(
      clientStorage.deleteAsync.bind(clientStorage),
      startEventLoop
    ),
    keysAsync: wrapAsync(
      clientStorage.keysAsync.bind(clientStorage),
      startEventLoop
    ),
    dropStore: wrapAsync(
      clientStorage.dropStore.bind(clientStorage),
      startEventLoop
    )
  };
}

/**
 * Wraps async viewer.tools methods with event loop trigger
 *
 * WHY: Async methods in viewer.tools return Promises that resolve outside the
 * plugin's execution context. Without triggering startEventLoop(), the plugin
 * code freezes waiting for the promise result.
 *
 * CURRENT ASYNC METHODS IN viewer.tools:
 * - getTerrainHeightAsync: terrain height sampling
 * - getGeoidHeight: geoid height calculation
 * - getCurrentLocationAsync: browser geolocation API
 *
 * ADDING NEW ASYNC METHODS TO viewer.tools:
 * When adding new async methods to viewer.tools in the future:
 * 1. Add the method to this wrapper using wrapAsync()
 * 2. Use wrapAsync(commonReearth.viewer.tools.yourMethod, startEventLoop)
 * 3. See wrapAsync() documentation for examples
 *
 * SOLUTION: Use wrapAsync() utility to wrap each async method, ensuring the
 * plugin continues execution regardless of success or failure.
 */

function wrapCommonReearth(
  commonReearth: CommonReearth,
  startEventLoop: () => void,
  events: Pick<
    Context,
    | "cameraEvents"
    | "timelineEvents"
    | "layersEvents"
    | "sketchEvents"
    | "spatialIdEvents"
    | "selectionModeEvents"
  >,
  registerCleanup: (fn: () => void) => void
): CommonReearth {
  // camera/layers/sketch/spatialId/timeline/selectionMode listeners are
  // otherwise passed straight through from `commonReearth` unmodified - see
  // trackedEventPair() above for why that leaks a listener per plugin
  // instance that ever calls one of these `.on(...)` methods.
  const camera = trackedEventPair(
    events.cameraEvents,
    registerCleanup,
    "camera"
  ) as {
    on: Reearth["camera"]["on"];
    off: Reearth["camera"]["off"];
  };
  const timeline = trackedEventPair(
    events.timelineEvents,
    registerCleanup,
    "timeline"
  ) as {
    on: Reearth["timeline"]["on"];
    off: Reearth["timeline"]["off"];
  };
  const layers = trackedEventPair(
    events.layersEvents,
    registerCleanup,
    "layers"
  ) as {
    on: Reearth["layers"]["on"];
    off: Reearth["layers"]["off"];
  };
  const sketch = trackedEventPair(
    events.sketchEvents,
    registerCleanup,
    "sketch"
  ) as {
    on: Reearth["sketch"]["on"];
    off: Reearth["sketch"]["off"];
  };
  const spatialId = trackedEventPair(
    events.spatialIdEvents,
    registerCleanup,
    "spatialId"
  ) as {
    on: Reearth["spatialId"]["on"];
    off: Reearth["spatialId"]["off"];
  };
  const selectionMode = trackedEventPair(
    events.selectionModeEvents,
    registerCleanup,
    "selectionMode"
  ) as {
    on: Reearth["viewer"]["interactionMode"]["selectionMode"]["on"];
    off: Reearth["viewer"]["interactionMode"]["selectionMode"]["off"];
  };

  return {
    ...commonReearth,
    viewer: copyWithOverrides(commonReearth.viewer, {
      tools: copyWithOverrides(commonReearth.viewer.tools, {
        getTerrainHeightAsync: wrapAsync(
          commonReearth.viewer.tools.getTerrainHeightAsync,
          startEventLoop
        ),
        getGeoidHeight: wrapAsync(
          commonReearth.viewer.tools.getGeoidHeight,
          startEventLoop
        ),
        getCurrentLocationAsync: wrapAsync(
          commonReearth.viewer.tools.getCurrentLocationAsync,
          startEventLoop
        )
      }),
      interactionMode: copyWithOverrides(
        commonReearth.viewer.interactionMode,
        {
          selectionMode: copyWithOverrides(
            commonReearth.viewer.interactionMode.selectionMode,
            {
              on: selectionMode.on,
              off: selectionMode.off
            }
          )
        }
      )
    }),
    camera: copyWithOverrides(commonReearth.camera, {
      on: camera.on,
      off: camera.off
    }),
    timeline: copyWithOverrides(commonReearth.timeline, {
      on: timeline.on,
      off: timeline.off
    }),
    layers: copyWithOverrides(commonReearth.layers, {
      on: layers.on,
      off: layers.off
    }),
    sketch: copyWithOverrides(commonReearth.sketch, {
      on: sketch.on,
      off: sketch.off
    }),
    spatialId: copyWithOverrides(commonReearth.spatialId, {
      on: spatialId.on,
      off: spatialId.off
    })
  };
}

/**
 * External close refs for modal and popup surfaces
 * These allow closing surfaces externally when another plugin takes over
 */
export type ExternalCloseRefs = {
  modalCloseRef: { current: (() => void) | null };
  popupCloseRef: { current: (() => void) | null };
};

/**
 * Creates the exposed API factory function for Zushi
 *
 * This function returns a factory that Zushi will call with its PluginContext.
 * It maps the surface APIs to the current Re:Earth plugin API structure.
 *
 * CRITICAL: Accepts a getter function instead of direct context to ensure the
 * exposed API always accesses the latest plugin context values. This prevents
 * stale data when plugin properties, widget, or block data changes.
 *
 * @param getContext - Getter function that returns the latest ReearthPluginContext
 * @param messageHandlers - Message event handlers
 * @param registerCleanup - Callback to register cleanup functions
 * @param externalCloseRefs - Optional refs to store external close functions
 * @returns Factory function for Zushi's exposed parameter
 */
export function createZushiExposedAPI(
  getContext: () => ReearthPluginContext,
  messageHandlers: MessageHandlers,
  registerCleanup: (fn: () => void) => void,
  externalCloseRefs?: ExternalCloseRefs
) {
  return (zushiCtx: ZushiPluginContext): GlobalThis => {
    // Get initial context for callbacks that don't need freshness
    const reearthContext = getContext();
    const {
      onRender,
      onModalShow,
      onPopupShow,
      onModalClose,
      onPopupClose,
      getUIContainerRef,
      registerPluginMessageSender
    } = reearthContext;

    const startEventLoop = zushiCtx.startEventLoop;

    // Tracked on/off for every shared, per-Visualizer emitter reachable from
    // plugin code. See trackedEventPair() above for why this is necessary.
    const { on: viewerEventsOn, off: viewerEventsOff } = trackedEventPair(
      reearthContext.context.viewerEvents,
      registerCleanup,
      "viewer"
    ) as {
      on: Reearth["viewer"]["on"];
      off: Reearth["viewer"]["off"];
    };

    // Create surface adapters
    const ui = createUIAdapter(zushiCtx.surfaces.ui, onRender);
    const modal = createModalAdapter(
      zushiCtx.surfaces.modal,
      onRender,
      onModalShow,
      onModalClose,
      externalCloseRefs?.modalCloseRef
    );
    const popup = createPopupAdapter(
      zushiCtx.surfaces.popup,
      onRender,
      onPopupShow,
      onPopupClose,
      // Widget/block getters are accessed dynamically to get latest values
      () => getContext().getWidget,
      () => getContext().getBlock,
      getUIContainerRef,
      externalCloseRefs?.popupCloseRef
    );

    // Create extension message handler
    // context uses getter pattern in Plugin/hooks, so it's already fresh
    const extension = createExtensionMessageHandler(
      reearthContext.context,
      messageHandlers,
      startEventLoop,
      registerPluginMessageSender
    );

    // Wrap client storage with event loop trigger
    // context.clientStorage is accessed via context getter, so it's fresh
    const clientStorage = wrapClientStorage(
      reearthContext.context.clientStorage,
      startEventLoop
    );

    // Wrap commonReearth async methods with event loop trigger, and its
    // camera/timeline/layers/sketch/spatialId/selectionMode listeners with
    // dispose tracking (see trackedEventPair() above).
    // context.reearth is accessed via context getter, so it's fresh
    const wrappedCommonReearth = wrapCommonReearth(
      reearthContext.context.reearth,
      startEventLoop,
      reearthContext.context,
      registerCleanup
    );

    // Build and return the exposed API
    return exposedReearth({
      commonReearth: wrappedCommonReearth,
      // Access plugin dynamically to get latest property values
      plugin: () => getContext().plugin,
      // Viewer events (tracked above so they're removed on plugin dispose)
      viewerEventsOn,
      viewerEventsOff,
      // Timeline (accessed via context getter, already fresh)
      timelineManagerRef: reearthContext.context.timelineManagerRef,
      // UI surface
      render: ui.show,
      closeUI: ui.close,
      postMessage: ui.postMessage,
      resize: ui.resize,
      uiEventsOn: ui.on,
      uiEventsOff: ui.off,
      // Modal surface
      renderModal: modal.show,
      closeModal: modal.close,
      updateModal: modal.update,
      postMessageModal: modal.postMessage,
      modalEventsOn: modal.on,
      modalEventsOff: modal.off,
      // Popup surface
      renderPopup: popup.show,
      closePopup: popup.close,
      updatePopup: popup.update,
      postMessagePopup: popup.postMessage,
      popupEventsOn: popup.on,
      popupEventsOff: popup.off,
      // Extension
      extensionEventsOn: extension.on,
      extensionEventsOff: extension.off,
      // Viewer (accessed via context getter, already fresh)
      overrideViewerProperty: reearthContext.context.overrideViewerProperty,
      // Extension specifics - access dynamically to get latest values
      getWidget: () => getContext().getWidget,
      getBlock: () => getContext().getBlock,
      getLayer: () => getContext().getLayer,
      pluginPostMessage: extension.postMessage,
      // Data
      clientStorage
    });
  };
}
