/**
 * Zushi Plugin Hook
 *
 * This hook replaces the custom QuickJS implementation with Zushi framework.
 * It provides a compatible interface with the previous useHook implementation
 * while leveraging Zushi's managed plugin runtime.
 */

import { Plugin, quickjs } from "@reearth/zushi";
import type { ForwardedRef, RefObject } from "react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  ExternalCloseRefs,
  ReearthPluginContext
} from "../pluginAPI/zushiAdapter";
import { createZushiExposedAPI } from "../pluginAPI/zushiAdapter";

/**
 * Hook options - compatible with previous implementation
 */
export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  autoResize?: "both" | "width-only" | "height-only";
  isMarshalable?: boolean | "json" | ((obj: unknown) => boolean | "json");
  ref?: ForwardedRef<Ref>;
  pluginContext: ReearthPluginContext;
  onError?: (err: unknown) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  onMessage?: (msg: unknown) => void;
  /**
   * Callback to register the modal close function with the parent.
   * Called when the plugin is initialized with a function that can
   * externally close the modal (fires close events, hides surface).
   */
  onRegisterModalClose?: (closeFn: () => void) => void;
  /**
   * Callback to register the popup close function with the parent.
   * Called when the plugin is initialized with a function that can
   * externally close the popup (fires close events, hides surface).
   */
  onRegisterPopupClose?: (closeFn: () => void) => void;
};

/**
 * Surface container refs - for DOM mounting
 */
export type SurfaceRefs = {
  uiContainer: RefObject<HTMLDivElement | null>;
  modalContainer: RefObject<HTMLDivElement | null>;
  popupContainer: RefObject<HTMLDivElement | null>;
};

/**
 * Ref interface exposed via useImperativeHandle
 */
export type Ref = {
  getPlugin: () => Plugin | undefined;
};

/**
 * Hook return value - maintains compatibility with previous interface
 */
export type UseZushiPluginReturn = {
  loaded: boolean;
  handleMessage: (msg: unknown) => void;
  surfaceRefs: SurfaceRefs;
  modalElement: HTMLDivElement;
  popupElement: HTMLDivElement;
};

/**
 * Default error handler
 */
const defaultOnError = (err: unknown) => {
  console.error("plugin error", err);
};

/**
 * Default marshaling strategy - same as previous implementation
 */
const AsyncFunction = (async () => {}).constructor;

export const defaultIsMarshalable = (obj: unknown): boolean => {
  return (
    ((typeof obj !== "object" || obj === null) && typeof obj !== "function") ||
    Array.isArray(obj) ||
    Object.getPrototypeOf(obj) === Function.prototype ||
    Object.getPrototypeOf(obj) === Object.prototype ||
    obj instanceof Date ||
    obj instanceof Promise ||
    obj instanceof AsyncFunction
  );
};

/**
 * Zushi Plugin Hook
 *
 * Manages plugin lifecycle using Zushi framework instead of manual QuickJS.
 * Provides surfaces for UI, modal, and popup rendering.
 */
export default function useZushiPlugin({
  src,
  sourceCode,
  skip,
  autoResize,
  isMarshalable = defaultIsMarshalable,
  ref,
  pluginContext,
  onPreInit,
  onError = defaultOnError,
  onDispose,
  onMessage: rawOnMessage,
  onRegisterModalClose,
  onRegisterPopupClose
}: Options): UseZushiPluginReturn {
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const pluginRef = useRef<Plugin | undefined>(undefined);

  // External close refs - populated by the modal/popup adapters so the parent can
  // close surfaces (close-before-show) while still firing each surface's close events
  const externalCloseRefs = useRef<ExternalCloseRefs>({
    modalCloseRef: { current: null },
    popupCloseRef: { current: null }
  });

  /**
   * pluginContextRef Pattern
   *
   * WHY: The Zushi exposed API is created once during plugin.start() and cannot be
   * updated. However, we need to access the latest context data (e.g., updated block
   * properties) from within the exposed API functions.
   *
   * PROBLEM: If we put `pluginContext` in the useEffect dependencies, the effect would
   * run whenever pluginContext changes, causing the plugin to be disposed and
   * reinitialized. This is expensive (QuickJS runtime + code loading).
   *
   * SOLUTION: Store pluginContext in a ref and pass the ref to the exposed API factory.
   * The exposed API functions read from pluginContextRef.current to get the latest data.
   *
   * HOW:
   * 1. Store pluginContext in ref (updated every render)
   * 2. Pass pluginContextRef to createZushiExposedAPI
   * 3. Omit pluginContext from useEffect dependencies
   * 4. Exposed API functions access latest context via pluginContextRef.current
   *
   * CRITICAL: This prevents plugin remounts while still providing access to latest
   * context data within the plugin's exposed API.
   */
  const pluginContextRef = useRef(pluginContext);
  useEffect(() => {
    pluginContextRef.current = pluginContext;
  });

  // Message event handlers
  const messageEvents = useMemo(() => new Set<(msg: unknown) => void>(), []);
  const messageOnceEvents = useMemo(() => new Set<(msg: unknown) => void>(), []);

  // Surface container refs
  const uiContainer = useRef<HTMLDivElement>(null);

  // Cleanup callbacks registered by the exposed API (e.g. viewer event unsubscription)
  const disposeCallbacksRef = useRef<(() => void)[]>([]);

  const runDisposeCallbacks = useCallback(() => {
    while (disposeCallbacksRef.current.length) {
      const cleanup = disposeCallbacksRef.current.pop();
      try {
        cleanup?.();
      } catch (err) {
        console.error("Plugin cleanup: error running exposed API cleanup", err);
      }
    }
  }, []);

  // Create modal and popup containers once - these will be manually appended
  const modalContainerElement = useMemo(() => {
    const div = document.createElement("div");
    div.className = "zushi-modal-surface-container";
    return div;
  }, []);

  const popupContainerElement = useMemo(() => {
    const div = document.createElement("div");
    div.className = "zushi-popup-surface-container";
    return div;
  }, []);

  // Wrap elements in refs so Zushi can access them
  const modalContainer = useMemo(() => ({ current: modalContainerElement }), [modalContainerElement]);
  const popupContainer = useMemo(() => ({ current: popupContainerElement }), [popupContainerElement]);

  // Message handler registration
  const onMessage = useCallback(
    (handler: (msg: unknown) => void) => {
      messageEvents.add(handler);
    },
    [messageEvents]
  );

  const offMessage = useCallback(
    (handler: (msg: unknown) => void) => {
      messageEvents.delete(handler);
    },
    [messageEvents]
  );

  const onceMessage = useCallback(
    (handler: (msg: unknown) => void) => {
      messageOnceEvents.add(handler);
    },
    [messageOnceEvents]
  );

  // Handle incoming messages from plugin
  const handleMessage = useCallback(
    (msg: unknown) => {
      try {
        messageEvents.forEach((e) => e(msg));
        messageOnceEvents.forEach((e) => e(msg));
      } catch (e) {
        onError(e);
      }
      rawOnMessage?.(msg);
      messageOnceEvents.clear();
    },
    [messageEvents, messageOnceEvents, onError, rawOnMessage]
  );

  // Expose modal/popup containers to parent for manual DOM management
  useEffect(() => {
    return () => {
      // Cleanup: remove elements from DOM when unmounting
      modalContainerElement.remove();
      popupContainerElement.remove();
    };
  }, [modalContainerElement, popupContainerElement]);

  // Load plugin code
  useEffect(() => {
    (async () => {
      const code = sourceCode ?? (src ? await (await fetch(src)).text() : "");
      setCode(code);
    })();
  }, [sourceCode, src]);

  // Initialize and manage Zushi plugin
  useEffect(() => {
    if (skip || !code) return;
    if (!uiContainer.current || !modalContainer.current || !popupContainer.current) {
      return;
    }

    onPreInit?.();

    // Guards against a mount/unmount race: if this effect's cleanup runs
    // while `plugin.start()` is still pending, we must dispose the plugin
    // that resolves afterward instead of resurrecting it into the refs below.
    let disposed = false;

    (async () => {
      try {
        // Determine marshaling strategy
        const marshalableOption =
          typeof isMarshalable === "function"
            ? isMarshalable
            : isMarshalable === "json" || isMarshalable === false
              ? "json"
              : true;

        // Create message handlers for the adapter
        // dispatchMessage routes messages from Zushi's built-in surface
        // message events (see createZushiExposedAPI) into the plugin's
        // registered extension message handlers.
        const messageHandlers = {
          onMessage,
          offMessage,
          onceMessage,
          dispatchMessage: handleMessage
        };

        // Create Zushi plugin instance
        const plugin = new Plugin({
          code,
          backend: quickjs({
            isMarshalable: marshalableOption
          }),
          surfaces: {
            ui: {
              container: uiContainer.current as HTMLElement,
              autoResize: autoResize ?? "both" // Use prop value, default to "both"
            },
            modal: {
              container: modalContainer.current as HTMLElement,
              autoResize: "both" // Modal always uses "both"
            },
            popup: {
              container: popupContainer.current as HTMLElement,
              autoResize: "both" // Popup always uses "both"
            }
          },
          // Pass getter function to access latest context dynamically
          exposed: createZushiExposedAPI(
            () => pluginContextRef.current,
            messageHandlers,
            (fn) => disposeCallbacksRef.current.push(fn),
            externalCloseRefs.current
          )
        });

        // Start the plugin
        await plugin.start();

        if (disposed) {
          // Unmounted while start() was in flight - nothing above was assigned
          // to pluginRef yet, so just tear down what start() already registered
          // (e.g. viewer event listeners) and dispose.
          runDisposeCallbacks();
          try {
            plugin.dispose();
          } catch (err) {
            console.error("Zushi plugin dispose error", err);
          }
          return;
        }

        pluginRef.current = plugin;
        setLoaded(true);
      } catch (err) {
        // If code before this point (e.g. plugin.start()) registered any
        // exposed-API cleanups - such as viewer event listeners - before
        // failing, tear those down now instead of leaving them registered
        // on the shared emitter until unmount.
        runDisposeCallbacks();
        onError(err);
      }
    })();

    // Cleanup on unmount
    return () => {
      disposed = true;

      // Tear down anything the exposed API registered (e.g. viewer event listeners)
      runDisposeCallbacks();

      // Call onDispose before cleanup
      try {
        onDispose?.();
      } catch (err) {
        console.error("Plugin cleanup: error disposing plugin events", err);
      }

      // Clear message events
      messageEvents.clear();
      messageOnceEvents.clear();

      // Dispose Zushi plugin
      if (pluginRef.current) {
        try {
          pluginRef.current.dispose();
        } catch (err) {
          console.error("Zushi plugin dispose error", err);
        } finally {
          pluginRef.current = undefined;
        }
      }

      setLoaded(false);
    };
    // Removed pluginContext from dependencies to prevent remounts when context changes
    // pluginContextRef is used instead to access latest context
  }, [
    code,
    skip,
    autoResize,
    isMarshalable,
    onPreInit,
    onDispose,
    onError,
    onMessage,
    offMessage,
    onceMessage,
    handleMessage,
    messageEvents,
    messageOnceEvents,
    modalContainer,
    popupContainer,
    runDisposeCallbacks
  ]);

  // Register external close callbacks with parent when plugin is loaded
  useEffect(() => {
    if (!loaded) return;

    // Register modal close callback
    const modalClose = externalCloseRefs.current.modalCloseRef.current;
    if (modalClose && onRegisterModalClose) {
      onRegisterModalClose(modalClose);
    }

    // Register popup close callback
    const popupClose = externalCloseRefs.current.popupCloseRef.current;
    if (popupClose && onRegisterPopupClose) {
      onRegisterPopupClose(popupClose);
    }
  }, [loaded, onRegisterModalClose, onRegisterPopupClose]);

  // Expose plugin instance via ref
  useImperativeHandle(
    ref,
    (): Ref => ({
      getPlugin: () => pluginRef.current
    }),
    []
  );

  return {
    loaded,
    handleMessage,
    surfaceRefs: {
      uiContainer,
      modalContainer,
      popupContainer
    },
    modalElement: modalContainerElement,
    popupElement: popupContainerElement
  };
}
