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

import type { ReearthPluginContext } from "../pluginAPI/zushiAdapter";
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
  onMessage: rawOnMessage
}: Options): UseZushiPluginReturn {
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const pluginRef = useRef<Plugin | undefined>(undefined);

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

  // Generate a unique ID for this plugin instance to filter window messages
  // Only compute once on initial render to prevent remounts
  const pluginInstanceId = useMemo(() => {
    return pluginContext.plugin?.id && pluginContext.plugin?.extensionId
      ? `${pluginContext.plugin.id}/${pluginContext.plugin.extensionId}/${pluginContext.getWidget?.()?.id ?? pluginContext.getBlock?.()?.id}`
      : Math.random().toString(36).substring(7);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Message event handlers
  const messageEvents = useMemo(() => new Set<(msg: unknown) => void>(), []);
  const messageOnceEvents = useMemo(() => new Set<(msg: unknown) => void>(), []);

  // Surface container refs
  const uiContainer = useRef<HTMLDivElement>(null);

  // Store references to surface iframe windows for message filtering
  const surfaceWindowsRef = useRef<Set<Window>>(new Set());

  // Store MutationObserver for cleanup
  const iframeObserverRef = useRef<MutationObserver | undefined>(undefined);

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
        const messageHandlers = {
          onMessage,
          offMessage,
          onceMessage
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
          // Use ref to access latest context without causing remounts
          exposed: createZushiExposedAPI(pluginContextRef.current, messageHandlers)
        });

        // Start the plugin
        await plugin.start();

        /**
         * Iframe Window Registration with Load Event Handling
         *
         * WHY: We need to track which iframe windows belong to this plugin instance
         * to filter postMessage events. Only messages from our plugin's iframes should
         * be processed; messages from other plugins must be ignored.
         *
         * PROBLEM: When an iframe is created, its contentWindow may not be immediately
         * available:
         * - Zushi calls surface.show() which creates an iframe
         * - The iframe element exists in the DOM
         * - But iframe.contentWindow is null until the iframe loads
         * - If we try to register it immediately, we get null
         *
         * This caused the modal close button bug: the modal iframe existed but its
         * contentWindow was never registered, so messages from it were filtered out.
         *
         * SOLUTION: Try to register immediately, but if contentWindow is null, attach
         * a load event listener to register it later when the iframe loads.
         *
         * HOW:
         * 1. Query for all iframes in the container
         * 2. Try to register iframe.contentWindow immediately
         * 3. If null, attach a 'load' event listener (once: true)
         * 4. When iframe loads, register its contentWindow
         *
         * This pattern is applied to:
         * - Initial collection after plugin.start()
         * - MutationObserver detection of dynamically added iframes
         */
        surfaceWindowsRef.current.clear();
        const collectIframeWindows = (container: HTMLElement) => {
          const iframes = container.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            const registerWindow = () => {
              if (iframe.contentWindow) {
                surfaceWindowsRef.current.add(iframe.contentWindow);
                return true;
              }
              return false;
            };

            // Try to register immediately
            if (!registerWindow()) {
              // If contentWindow is not available yet, wait for load event
              iframe.addEventListener('load', () => {
                registerWindow();
              }, { once: true });
            }
          });
        };

        if (uiContainer.current) collectIframeWindows(uiContainer.current);
        if (modalContainer.current) collectIframeWindows(modalContainer.current);
        if (popupContainer.current) collectIframeWindows(popupContainer.current);

        // Watch for dynamically added iframes (e.g., when popup.show() is called)
        const observerCallback: MutationCallback = (mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;

                // Check if it's an iframe
                if (element.tagName === 'IFRAME') {
                  const iframe = element as HTMLIFrameElement;

                  // contentWindow might be null immediately after creation
                  // Try to register immediately, or wait for load
                  const registerWindow = () => {
                    if (iframe.contentWindow) {
                      surfaceWindowsRef.current.add(iframe.contentWindow);
                      return true;
                    }
                    return false;
                  };

                  // Try immediately
                  if (!registerWindow()) {
                    // If not available, wait for load event
                    iframe.addEventListener('load', () => {
                      registerWindow();
                    }, { once: true });
                  }
                }
                // Check if the added element contains nested iframes
                // Use collectIframeWindows to handle load event timing
                collectIframeWindows(element);
              }
            });
          });
        };

        const observer = new MutationObserver(observerCallback);
        const observerConfig = { childList: true, subtree: true };

        // Observe all surface containers
        if (uiContainer.current) observer.observe(uiContainer.current, observerConfig);
        if (modalContainer.current) observer.observe(modalContainer.current, observerConfig);
        if (popupContainer.current) observer.observe(popupContainer.current, observerConfig);

        // Store observer for cleanup
        iframeObserverRef.current = observer;

        pluginRef.current = plugin;
        setLoaded(true);
      } catch (err) {
        onError(err);
      }
    })();

    // Cleanup on unmount
    return () => {
      // Disconnect MutationObserver
      if (iframeObserverRef.current) {
        iframeObserverRef.current.disconnect();
        iframeObserverRef.current = undefined;
      }

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
    messageEvents,
    messageOnceEvents,
    modalContainer,
    popupContainer
  ]);

  // Listen for window postMessage events from plugin UI
  // Filter based on iframe source window
  useEffect(() => {
    const handleWindowMessage = (ev: MessageEvent) => {
      if (!loaded) return;

      // Check if the message comes from one of our plugin's surface iframes
      const isFromOurPlugin = surfaceWindowsRef.current.has(ev.source as Window);

      // Only process messages from our plugin's iframes
      if (!isFromOurPlugin) {
        // Silently ignore messages from other plugins
        return;
      }

      // Route message to plugin extension
      handleMessage(ev.data);
    };

    window.addEventListener("message", handleWindowMessage);

    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [loaded, handleMessage, pluginInstanceId]);

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
