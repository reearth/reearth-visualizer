/**
 * Zushi Adapter
 *
 * This module provides the bridge between Zushi's surface API and the current
 * Re:Earth plugin API structure. It maps Zushi surfaces (ui, modal, popup) to
 * the existing iframe-based API interface.
 */

import type { Layer } from "@reearth/core";
import type {
  SurfaceAPI,
  PluginContext as ZushiPluginContext
} from "@reearth/zushi";

import type { Widget } from "../../Widgets";
import type { PluginPopupInfo } from "../Plugin/PopupContainer";
import type { Context } from "../types";

import { exposedReearth } from "./exposedReearth";
import type { GlobalThis, Reearth } from "./types";

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
 * Creates a close event manager for a surface
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
          console.error(`[Zushi Adapter] Error in ${surfaceName} close handler:`, err);
        }
      });
      // Execute once handlers and clear them
      onceHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error(`[Zushi Adapter] Error in ${surfaceName} close once handler:`, err);
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
 */
function createModalAdapter(
  surface: SurfaceAPI,
  onRender?: (type: string) => void,
  onModalShow?: (options?: { background?: string; clickBgToClose?: boolean }) => void,
  onModalClose?: () => void
): {
  show: Reearth["modal"]["show"];
  close: Reearth["modal"]["close"];
  update: Reearth["modal"]["update"];
  postMessage: Reearth["modal"]["postMessage"];
  on: Reearth["modal"]["on"];
  off: Reearth["modal"]["off"];
} {
  const closeEvents = createCloseEventManager("Modal");

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
      closeEvents.trigger();
      onModalClose?.();
    },
    update: (options) => {
      surface.update({
        width: options?.width,
        height: options?.height
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
 */
function createPopupAdapter(
  surface: SurfaceAPI,
  onRender?: (type: string) => void,
  onPopupShow?: (options?: PluginPopupInfo) => void,
  onPopupClose?: () => void,
  getWidget?: () => Widget | undefined,
  getBlock?: () => Reearth["extension"]["block"] | undefined,
  getUIContainerRef?: () => { current: HTMLElement | null } | undefined
): {
  show: Reearth["popup"]["show"];
  close: Reearth["popup"]["close"];
  update: Reearth["popup"]["update"];
  postMessage: Reearth["popup"]["postMessage"];
  on: Reearth["popup"]["on"];
  off: Reearth["popup"]["off"];
} {
  const closeEvents = createCloseEventManager("Popup");

  return {
    show: (html, options) => {
      surface.setVisible(true);
      surface.show(html, {
        width: options?.width,
        height: options?.height,
        visible: true
      });
      onRender?.("popup");

      const widget = getWidget?.();
      const block = getBlock?.();
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
      closeEvents.trigger();
      onPopupClose?.();
    },
    update: (options) => {
      surface.update({
        width: options?.width,
        height: options?.height
      });

      const widget = getWidget?.();
      const block = getBlock?.();
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
          console.error("[Zushi Adapter] Error in extensionMessage handler:", err);
        }
      });
      // Emit to once handlers and clear them
      extensionMessageOnceHandlers.forEach((handler) => {
        try {
          handler(msg);
        } catch (err) {
          console.error("[Zushi Adapter] Error in extensionMessage once handler:", err);
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
    postMessage: (extensionId: string, msg: unknown, sender: string) => {
      context.pluginInstances.postMessage(extensionId, msg, sender);
    },
    on: (type: string, callback: (...args: any[]) => void, options?: { once?: boolean }) => {
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
 * Wraps client storage methods with event loop trigger
 */
function wrapClientStorage(
  clientStorage: Context["clientStorage"],
  startEventLoop: () => void
): Context["clientStorage"] {
  return {
    ...clientStorage,
    getAsync: (extensionInstanceId: string, key: string) => {
      const promise = clientStorage.getAsync(extensionInstanceId, key);
      promise.then(() => startEventLoop()).catch(() => startEventLoop());
      return promise;
    },
    setAsync: (extensionInstanceId: string, key: string, value: unknown) => {
      const promise = clientStorage.setAsync(extensionInstanceId, key, value);
      promise.then(() => startEventLoop()).catch(() => startEventLoop());
      return promise;
    },
    deleteAsync: (extensionInstanceId: string, key: string) => {
      const promise = clientStorage.deleteAsync(extensionInstanceId, key);
      promise.then(() => startEventLoop()).catch(() => startEventLoop());
      return promise;
    },
    keysAsync: (extensionInstanceId: string) => {
      const promise = clientStorage.keysAsync(extensionInstanceId);
      promise.then(() => startEventLoop()).catch(() => startEventLoop());
      return promise;
    },
    dropStore: (extensionInstanceId: string) => {
      const promise = clientStorage.dropStore(extensionInstanceId);
      promise.then(() => startEventLoop()).catch(() => startEventLoop());
      return promise;
    }
  };
}

/**
 * Creates the exposed API factory function for Zushi
 *
 * This function returns a factory that Zushi will call with its PluginContext.
 * It maps the surface APIs to the current Re:Earth plugin API structure.
 *
 * @param reearthContext - The Re:Earth plugin and context information
 * @param messageHandlers - Message event handlers
 * @returns Factory function for Zushi's exposed parameter
 */
export function createZushiExposedAPI(
  reearthContext: ReearthPluginContext,
  messageHandlers: MessageHandlers
) {
  return (zushiCtx: ZushiPluginContext): GlobalThis => {
    const {
      plugin,
      context,
      getWidget,
      getBlock,
      getLayer,
      getUIContainerRef,
      onRender,
      onModalShow,
      onPopupShow,
      onModalClose,
      onPopupClose,
      registerPluginMessageSender
    } = reearthContext;

    const startEventLoop = zushiCtx.startEventLoop;

    // Create surface adapters
    const ui = createUIAdapter(zushiCtx.surfaces.ui, onRender);
    const modal = createModalAdapter(
      zushiCtx.surfaces.modal,
      onRender,
      onModalShow,
      onModalClose
    );
    const popup = createPopupAdapter(
      zushiCtx.surfaces.popup,
      onRender,
      onPopupShow,
      onPopupClose,
      getWidget,
      getBlock,
      getUIContainerRef
    );

    // Create extension message handler
    const extension = createExtensionMessageHandler(
      context,
      messageHandlers,
      startEventLoop,
      registerPluginMessageSender
    );

    // Wrap client storage with event loop trigger
    const clientStorage = wrapClientStorage(context.clientStorage, startEventLoop);

    // Build and return the exposed API
    return exposedReearth({
      commonReearth: context.reearth,
      plugin,
      // Viewer events
      viewerEventsOn: context.viewerEvents.on,
      viewerEventsOff: context.viewerEvents.off,
      // Timeline
      timelineManagerRef: context.timelineManagerRef,
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
      // Viewer
      overrideViewerProperty: context.overrideViewerProperty,
      // Extension specifics
      getWidget,
      getBlock,
      getLayer,
      pluginPostMessage: extension.postMessage,
      // Data
      clientStorage
    });
  };
}
