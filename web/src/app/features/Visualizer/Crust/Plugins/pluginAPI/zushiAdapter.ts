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
      //unregisterPluginMessageSender
    } = reearthContext;
    const { onMessage, offMessage, onceMessage } = messageHandlers;

    // Get the startEventLoop function from Zushi context
    const startEventLoop = zushiCtx.startEventLoop;

    // Event handlers for UI/Modal/Popup
    const uiCloseHandlers = new Set<() => void>();
    const uiCloseOnceHandlers = new Set<() => void>();
    const modalCloseHandlers = new Set<() => void>();
    const modalCloseOnceHandlers = new Set<() => void>();
    const popupCloseHandlers = new Set<() => void>();
    const popupCloseOnceHandlers = new Set<() => void>();

    // Event handlers for extensionMessage
    const extensionMessageHandlers = new Set<(msg: unknown) => void>();
    const extensionMessageOnceHandlers = new Set<(msg: unknown) => void>();

    // Extract surfaces from Zushi's context
    const surfaces = {
      ui: zushiCtx.surfaces.ui,
      modal: zushiCtx.surfaces.modal,
      popup: zushiCtx.surfaces.popup
    };

    // Map UI surface to render/postMessage/resize/close
    const render: Reearth["ui"]["show"] = (html, options) => {
      // Ensure surface is visible
      surfaces.ui.setVisible(true);

      surfaces.ui.show(html, {
        width: options?.width,
        height: options?.height,
        visible: options?.visible ?? true
      });
      onRender?.("ui");
    };

    const postMessage: Reearth["ui"]["postMessage"] = (msg) => {
      surfaces.ui.postMessage(msg);
    };

    const resize: Reearth["ui"]["resize"] = (width, height, _extended) => {
      surfaces.ui.update({
        width,
        height
        // Note: extended is not directly supported by Zushi
        // May need to handle this separately if needed
      });
    };

    const closeUI: Reearth["ui"]["close"] = () => {
      surfaces.ui.setVisible(false);

      // Trigger close event handlers
      uiCloseHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error("[Zushi Adapter] Error in UI close handler:", err);
        }
      });
      uiCloseOnceHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error("[Zushi Adapter] Error in UI close once handler:", err);
        }
      });
      uiCloseOnceHandlers.clear();
    };

    // UI event handlers
    const uiEventsOn: Reearth["ui"]["on"] = (type, callback, options) => {
      if (type === "close") {
        if (options?.once) {
          uiCloseOnceHandlers.add(callback as () => void);
        } else {
          uiCloseHandlers.add(callback as () => void);
        }
      }
      // Other event types can be added here
    };

    const uiEventsOff: Reearth["ui"]["off"] = (type, callback) => {
      if (type === "close") {
        uiCloseHandlers.delete(callback as () => void);
        uiCloseOnceHandlers.delete(callback as () => void);
      }
    };

    // Map Modal surface
    const renderModal: Reearth["modal"]["show"] = (html, options) => {
      // First ensure surface is visible (in case it was hidden before)
      surfaces.modal.setVisible(true);

      // Then render the content
      surfaces.modal.show(html, {
        width: options?.width,
        height: options?.height,
        visible: true
      });
      onRender?.("modal");
      // Notify parent component to show modal
      onModalShow?.({
        background: options?.background,
        clickBgToClose: options?.clickBgToClose
      });
    };

    const closeModal: Reearth["modal"]["close"] = () => {
      surfaces.modal.setVisible(false);

      // Trigger close event handlers
      modalCloseHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error("[Zushi Adapter] Error in modal close handler:", err);
        }
      });
      modalCloseOnceHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error(
            "[Zushi Adapter] Error in modal close once handler:",
            err
          );
        }
      });
      modalCloseOnceHandlers.clear();

      // Notify parent component to hide modal
      onModalClose?.();
    };

    const updateModal: Reearth["modal"]["update"] = (options) => {
      surfaces.modal.update({
        width: options?.width,
        height: options?.height
      });
    };

    const postMessageModal: Reearth["modal"]["postMessage"] = (msg) => {
      surfaces.modal.postMessage(msg);
    };

    const modalEventsOn: Reearth["modal"]["on"] = (type, callback, options) => {
      if (type === "close") {
        if (options?.once) {
          modalCloseOnceHandlers.add(callback as () => void);
        } else {
          modalCloseHandlers.add(callback as () => void);
        }
      }
      // Other event types can be added here
    };

    const modalEventsOff: Reearth["modal"]["off"] = (type, callback) => {
      if (type === "close") {
        modalCloseHandlers.delete(callback as () => void);
        modalCloseOnceHandlers.delete(callback as () => void);
      }
    };

    // Map Popup surface
    const renderPopup: Reearth["popup"]["show"] = (html, options) => {
      // First ensure surface is visible (in case it was hidden before)
      surfaces.popup.setVisible(true);

      surfaces.popup.show(html, {
        width: options?.width,
        height: options?.height,
        visible: true
      });
      onRender?.("popup");

      // Notify parent component to show popup with proper info
      const widget = getWidget?.();
      const block = getBlock?.();
      const uiContainerRef = getUIContainerRef?.();

      onPopupShow?.({
        id: widget?.id ?? block?.id,
        position: options?.position ?? "bottom",
        offset: options?.offset,
        ref: uiContainerRef as any // Cast to match RefObject<HTMLIFrameElement> type
      });
    };

    const closePopup: Reearth["popup"]["close"] = () => {
      surfaces.popup.setVisible(false);

      // Trigger close event handlers
      popupCloseHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error("[Zushi Adapter] Error in popup close handler:", err);
        }
      });
      popupCloseOnceHandlers.forEach((handler) => {
        try {
          handler();
        } catch (err) {
          console.error(
            "[Zushi Adapter] Error in popup close once handler:",
            err
          );
        }
      });
      popupCloseOnceHandlers.clear();

      // Notify parent component to hide popup
      onPopupClose?.();
    };

    const updatePopup: Reearth["popup"]["update"] = (options) => {
      surfaces.popup.update({
        width: options?.width,
        height: options?.height
      });

      // Notify parent component about popup update
      const widget = getWidget?.();
      const block = getBlock?.();
      const uiContainerRef = getUIContainerRef?.();
      onPopupShow?.({
        id: widget?.id ?? block?.id,
        position: options?.position ?? "bottom",
        offset: options?.offset,
        ref: uiContainerRef as any // Cast to match RefObject<HTMLIFrameElement> type
      });
    };

    const postMessagePopup: Reearth["popup"]["postMessage"] = (msg) => {
      surfaces.popup.postMessage(msg);
    };

    const popupEventsOn: Reearth["popup"]["on"] = (type, callback, options) => {
      if (type === "close") {
        if (options?.once) {
          popupCloseOnceHandlers.add(callback as () => void);
        } else {
          popupCloseHandlers.add(callback as () => void);
        }
      }
      // Other event types can be added here
    };

    const popupEventsOff: Reearth["popup"]["off"] = (type, callback) => {
      if (type === "close") {
        popupCloseHandlers.delete(callback as () => void);
        popupCloseOnceHandlers.delete(callback as () => void);
      }
    };

    // Extension message handling
    const pluginPostMessage = (
      extensionId: string,
      msg: unknown,
      sender: string
    ) => {
      context.pluginInstances.postMessage(extensionId, msg, sender);
    };

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

        // Trigger event loop after message handling
        startEventLoop();
      } catch (err) {
        console.error("[Zushi Adapter] Error handling extensionMessage:", err);
      }
    };

    // Register the plugin message sender with the context
    registerPluginMessageSender?.(pluginMessageSender);

    // Now call the existing exposedReearth with mapped APIs
    const exposedAPI = exposedReearth({
      commonReearth: context.reearth,
      plugin,
      // Viewer events
      viewerEventsOn: context.viewerEvents.on,
      viewerEventsOff: context.viewerEvents.off,
      // Timeline
      timelineManagerRef: context.timelineManagerRef,
      // UI
      render,
      closeUI,
      postMessage,
      resize,
      uiEventsOn,
      uiEventsOff,
      // Modal
      renderModal,
      closeModal,
      updateModal,
      postMessageModal,
      modalEventsOn,
      modalEventsOff,
      // Popup
      renderPopup,
      closePopup,
      updatePopup,
      postMessagePopup,
      popupEventsOn,
      popupEventsOff,
      // Extension
      extensionEventsOn: (type, callback, options) => {
        // Map to message system
        if (type === "message") {
          if (options?.once) {
            onceMessage(callback as (msg: unknown) => void);
          } else {
            onMessage(callback as (msg: unknown) => void);
          }
        } else if (type === "extensionMessage") {
          if (options?.once) {
            extensionMessageOnceHandlers.add(
              callback as (msg: unknown) => void
            );
          } else {
            extensionMessageHandlers.add(callback as (msg: unknown) => void);
          }
        }
      },
      extensionEventsOff: (type, callback) => {
        if (type === "message") {
          offMessage(callback as (msg: unknown) => void);
        } else if (type === "extensionMessage") {
          extensionMessageHandlers.delete(callback as (msg: unknown) => void);
          extensionMessageOnceHandlers.delete(
            callback as (msg: unknown) => void
          );
        }
      },
      // Viewer
      overrideViewerProperty: context.overrideViewerProperty,
      // Extension specifics
      getWidget,
      getBlock,
      getLayer,
      pluginPostMessage,
      // Data
      clientStorage: {
        ...context.clientStorage,
        getAsync: (extensionInstanceId: string, key: string) => {
          const promise = context.clientStorage.getAsync(
            extensionInstanceId,
            key
          );
          promise.then(() => startEventLoop()).catch(() => startEventLoop());
          return promise;
        },
        setAsync: (
          extensionInstanceId: string,
          key: string,
          value: unknown
        ) => {
          const promise = context.clientStorage.setAsync(
            extensionInstanceId,
            key,
            value
          );
          promise.then(() => startEventLoop()).catch(() => startEventLoop());
          return promise;
        },
        deleteAsync: (extensionInstanceId: string, key: string) => {
          const promise = context.clientStorage.deleteAsync(
            extensionInstanceId,
            key
          );
          promise.then(() => startEventLoop()).catch(() => startEventLoop());
          return promise;
        },
        keysAsync: (extensionInstanceId: string) => {
          const promise = context.clientStorage.keysAsync(extensionInstanceId);
          promise.then(() => startEventLoop()).catch(() => startEventLoop());
          return promise;
        },
        dropStore: (extensionInstanceId: string) => {
          const promise = context.clientStorage.dropStore(extensionInstanceId);
          promise.then(() => startEventLoop()).catch(() => startEventLoop());
          return promise;
        }
      }
    });

    return exposedAPI;
  };
}
