import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "quickjs-emscripten-sync";
import type { RefObject } from "react";
import {
  ForwardedRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

import { IFrameAPI, Ref as IFrameRef } from "./PluginIFrame";

export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  isMarshalable?: boolean | "json" | ((obj: unknown) => boolean | "json");
  ref?: ForwardedRef<Ref>;
  mainIFrameRef?: RefObject<IFrameRef>;
  exposed?: ((api: API) => Record<string, unknown>) | Record<string, unknown>;
  onError?: (err: unknown) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  onMessage?: (msg: unknown) => void;
};

export type IFrameType = "main" | "modal" | "popup";

export type API = {
  main: IFrameAPI;
  modal: IFrameAPI;
  popup: IFrameAPI;
  messages: {
    on: (handler: (msg: unknown) => void) => void;
    off: (handler: (msg: unknown) => void) => void;
    once: (handler: (msg: unknown) => void) => void;
  };
  startEventLoop: () => void;
};

export type Ref = {
  arena: () => Arena | undefined;
};

const AsyncFunction = (async () => {}).constructor;

// restrict any classes
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

const defaultOnError = (err: unknown) => {
  console.error("plugin error", err);
};

export default function useHook({
  src,
  sourceCode,
  skip,
  isMarshalable,
  ref,
  exposed,
  onPreInit,
  onError = defaultOnError,
  onDispose,
  onMessage: rawOnMessage
}: Options = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");

  const onDisposeRef = useRef(onDispose);
  onDisposeRef.current = onDispose;

  const mainIFrameRef = useRef<IFrameRef>(null);
  const modalIFrameRef = useRef<IFrameRef>(null);
  const popupIFrameRef = useRef<IFrameRef>(null);

  const messageEvents = useMemo(() => new Set<(msg: unknown) => void>(), []);
  const messageOnceEvents = useMemo(
    () => new Set<(msg: unknown) => void>(),
    []
  );
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

  const eventLoopCb = useCallback(() => {
    if (!arena.current) return;
    try {
      arena.current.executePendingJobs();
      if (arena.current.context.runtime.hasPendingJob()) {
        eventLoop.current = window.setTimeout(eventLoopCb, 0);
      }
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  const startEventLoop = useCallback(() => {
    eventLoop.current = window.setTimeout(eventLoopCb, 0);
  }, [eventLoopCb]);

  const evalCode = useCallback(
    (code: string): unknown => {
      if (!arena.current) return;

      let result: unknown;
      try {
        result = arena.current.evalCode(code);
      } catch (err) {
        onError(err);
      }

      startEventLoop();

      return result;
    },
    [onError, startEventLoop]
  );

  useEffect(() => {
    (async () => {
      const code = sourceCode ?? (src ? await (await fetch(src)).text() : "");
      setCode(code);
    })();
  }, [sourceCode, src]);

  // init and dispose of vm
  useEffect(() => {
    if (skip || !code) return;
    const { api: mainIFrameApi } = mainIFrameRef.current ?? {};
    const { api: modalIFrameApi } = modalIFrameRef.current ?? {};
    const { api: popupIFrameApi } = popupIFrameRef.current ?? {};
    if (!mainIFrameApi || !modalIFrameApi || !popupIFrameApi) return;

    onPreInit?.();

    // Set up global error handler for QuickJS lifetime and runtime errors
    const globalErrorHandler = (event: ErrorEvent): boolean => {
      if (
        event.error &&
        (event.error.name === "QuickJSUseAfterFree" ||
          String(event.error).includes("Lifetime not alive") ||
          String(event.error).includes("list_empty(&rt->gc_obj_list)") ||
          String(event.error).includes("JS_FreeRuntime"))
      ) {
        // Silently prevent crash without logging to reduce console noise
        event.preventDefault();
        return false;
      }
      return true;
    };

    window.addEventListener("error", globalErrorHandler);

    (async () => {
      const ctx = (await getQuickJS()).newContext();
      arena.current = new Arena(ctx, {
        isMarshalable: (target) =>
          defaultIsMarshalable(target) ||
          (typeof isMarshalable === "function"
            ? isMarshalable(target)
            : "json"),
        experimentalContextEx: true
      });

      const e =
        typeof exposed === "function"
          ? exposed({
              main: mainIFrameApi,
              modal: modalIFrameApi,
              popup: popupIFrameApi,
              messages: {
                on: onMessage,
                off: offMessage,
                once: onceMessage
              },
              startEventLoop
            })
          : exposed;
      if (e) {
        arena.current.expose(e);
      }

      evalCode(code);
      setLoaded(true);
    })();

    const iframeRef = mainIFrameRef.current;

    return () => {
      // Remove global error handler
      window.removeEventListener("error", globalErrorHandler);

      // 1. Stop event loop first to prevent new callbacks
      if (typeof eventLoop.current === "number") {
        window.clearTimeout(eventLoop.current);
        eventLoop.current = undefined;
      }

      // 2. Clean up plugin events synchronously before arena disposal
      try {
        onDisposeRef.current?.();
      } catch (err) {
        console.error("Plugin cleanup: error disposing plugin events", err);
      }

      // 3. Clear message events
      messageEvents.clear();
      messageOnceEvents.clear();

      // 4. Reset iframe
      iframeRef?.reset();
      setLoaded(false);

      // 5. Arena disposal
      if (arena.current) {
        try {
          arena.current.dispose();
          arena.current.context.dispose();
        } catch (err) {
          console.debug("quickjs-emscripten dispose error", err);
        } finally {
          arena.current = undefined;
        }
      }
    };
  }, [
    code,
    evalCode,
    isMarshalable,
    onPreInit,
    skip,
    exposed,
    onMessage,
    offMessage,
    onceMessage,
    mainIFrameRef,
    messageEvents,
    messageOnceEvents,
    startEventLoop
  ]);

  useImperativeHandle(
    ref,
    (): Ref => ({
      arena: () => arena.current
    }),
    []
  );

  return {
    mainIFrameRef,
    modalIFrameRef,
    popupIFrameRef,
    loaded,
    handleMessage
  };
}
