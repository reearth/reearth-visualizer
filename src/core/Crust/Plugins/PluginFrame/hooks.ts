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
  useState,
} from "react";

import { IFrameAPI, Ref as IFrameRef } from "./PluginIFrame";

export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  isMarshalable?: boolean | "json" | ((obj: any) => boolean | "json");
  ref?: ForwardedRef<Ref>;
  mainIFrameRef?: RefObject<IFrameRef>;
  exposed?: ((api: API) => { [key: string]: any }) | { [key: string]: any };
  onError?: (err: any) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  onMessage?: (msg: any) => void;
};

export type IFrameType = "main" | "modal" | "popup";

export type API = {
  main: IFrameAPI;
  modal: IFrameAPI;
  popup: IFrameAPI;
  messages: {
    on: (e: (msg: any) => void) => void;
    off: (e: (msg: any) => void) => void;
    once: (e: (msg: any) => void) => void;
  };
  startEventLoop: () => void;
};

export type Ref = {
  arena: () => Arena | undefined;
};

const AsyncFunction = (async () => {}).constructor;

// restrict any classes
export const defaultIsMarshalable = (obj: any): boolean => {
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

const defaultOnError = (err: any) => {
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
  onMessage: rawOnMessage,
}: Options = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");

  const mainIFrameRef = useRef<IFrameRef>(null);
  const modalIFrameRef = useRef<IFrameRef>(null);
  const popupIFrameRef = useRef<IFrameRef>(null);

  const messageEvents = useMemo(() => new Set<(msg: any) => void>(), []);
  const messageOnceEvents = useMemo(() => new Set<(msg: any) => void>(), []);
  const onMessage = useCallback(
    (e: (msg: any) => void) => {
      messageEvents.add(e);
    },
    [messageEvents],
  );
  const offMessage = useCallback(
    (e: (msg: any) => void) => {
      messageEvents.delete(e);
    },
    [messageEvents],
  );
  const onceMessage = useCallback(
    (e: (msg: any) => void) => {
      messageOnceEvents.add(e);
    },
    [messageOnceEvents],
  );
  const handleMessage = useCallback(
    (msg: any) => {
      try {
        messageEvents.forEach(e => e(msg));
        messageOnceEvents.forEach(e => e(msg));
      } catch (e) {
        onError(e);
      }
      rawOnMessage?.(msg);
      messageOnceEvents.clear();
    },
    [messageEvents, messageOnceEvents, onError, rawOnMessage],
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
    (code: string): any => {
      if (!arena.current) return;

      let result: any;
      try {
        result = arena.current.evalCode(code);
      } catch (err) {
        onError(err);
      }

      startEventLoop();

      return result;
    },
    [onError, startEventLoop],
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

    (async () => {
      const ctx = (await getQuickJS()).newContext();
      arena.current = new Arena(ctx, {
        isMarshalable: target =>
          defaultIsMarshalable(target) ||
          (typeof isMarshalable === "function" ? isMarshalable(target) : "json"),
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
                once: onceMessage,
              },
              startEventLoop,
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
      onDispose?.();
      messageEvents.clear();
      messageOnceEvents.clear();
      iframeRef?.reset();
      setLoaded(false);
      if (typeof eventLoop.current === "number") {
        window.clearTimeout(eventLoop.current);
      }
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
    onDispose,
    onPreInit,
    skip,
    exposed,
    onMessage,
    offMessage,
    onceMessage,
    mainIFrameRef,
    messageEvents,
    messageOnceEvents,
    startEventLoop,
  ]);

  useImperativeHandle(
    ref,
    (): Ref => ({
      arena: () => arena.current,
    }),
    [],
  );

  return {
    mainIFrameRef,
    modalIFrameRef,
    popupIFrameRef,
    loaded,
    handleMessage,
  };
}
