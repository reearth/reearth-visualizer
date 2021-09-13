import { getQuickJS } from "quickjs-emscripten";
import Arena from "quickjs-emscripten-sync";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

import type { Ref as IFrameRef } from "./IFrame";

export type IFrameAPI = {
  render: (html: string, options?: { visible?: boolean }) => void;
  postMessage: (message: any) => void;
};

export type Options<T> = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  iframeCanBeVisible?: boolean;
  exposed?: { [key: string]: any };
  isMarshalable?: (obj: any) => boolean;
  onError?: (err: any) => void;
  staticExposed?: (api: IFrameAPI) => T;
};

// restrict any classes
const defaultIsMarshalable = (obj: any): boolean => {
  return (
    ((typeof obj !== "object" || obj === null) && typeof obj !== "function") ||
    Array.isArray(obj) ||
    Object.getPrototypeOf(obj) === Function.prototype ||
    Object.getPrototypeOf(obj) === Object.prototype
  );
};

const defaultOnError = (err: any) => {
  console.error("plugin error", err?.message || err);
};

export default function useHook<T>({
  src,
  sourceCode,
  skip,
  iframeCanBeVisible,
  exposed,
  isMarshalable,
  onError = defaultOnError,
  staticExposed,
}: Options<T> = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const iFrameRef = useRef<IFrameRef>(null);
  const [[iFrameHtml, iFrameOptions], setIFrameState] = useState<
    [string, { visible?: boolean } | undefined]
  >(["", undefined]);

  const evalCode = useCallback(
    (code: string): any => {
      if (!arena.current) return;

      let result: any;
      try {
        result = arena.current.evalCode(code);
      } catch (err) {
        onError(err);
      }

      const eventLoopCb = () => {
        if (!arena.current) return;
        try {
          arena.current.executePendingJobs();
          if (arena.current.vm.hasPendingJob()) {
            eventLoop.current = window.setTimeout(eventLoopCb, 0);
          }
        } catch (err) {
          onError(err);
        }
      };
      eventLoop.current = window.setTimeout(eventLoopCb, 0);

      return result;
    },
    [onError],
  );

  const iFrameApi = useMemo<IFrameAPI>(
    () => ({
      render: (html, { visible = true, ...options } = {}) => {
        setIFrameState([html, { visible: !!iframeCanBeVisible && !!visible, ...options }]);
      },
      postMessage: msg => {
        iFrameRef.current?.postMessage(JSON.parse(JSON.stringify(msg)));
      },
    }),
    [iframeCanBeVisible],
  );

  const staticExpose = useCallback(() => {
    if (!arena.current) return;
    const exposed = staticExposed?.(iFrameApi);
    if (exposed) {
      arena.current.expose(exposed);
    }
  }, [iFrameApi, staticExposed]);

  // init and dispose of vm
  useEffect(() => {
    if (skip) return;

    (async () => {
      const vm = (await getQuickJS()).createVm();
      arena.current = new Arena(vm, {
        isMarshalable: target => defaultIsMarshalable(target) || !!isMarshalable?.(target),
      });
      staticExpose();
      setLoaded(true);
    })();

    return () => {
      if (typeof eventLoop.current === "number") {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        window.clearTimeout(eventLoop.current);
      }
      if (arena.current) {
        try {
          arena.current.dispose();
          arena.current.vm.dispose();
        } catch (err) {
          console.error(err);
        } finally {
          arena.current = undefined;
          setLoaded(false);
        }
      }
    };
  }, [isMarshalable, onError, skip, src, sourceCode, staticExpose]);

  const exposer = useMemo(() => {
    if (!arena.current || !loaded) return;
    return arena.current.evalCode<(keys: string[], value: any) => void>(`(keys, value) => {
      if (!keys.length) return;
      let o = globalThis;
      for (const k of keys.slice(0, -1)) {
        if (typeof o !== "object") break;
        if (typeof o?.[k] !== "object") {
          o[k] = {};
        }
        o = o[k];
      }
      if (typeof o !== "object") return;
      o[keys[keys.length - 1]] = value;
    }`);
  }, [loaded]);

  useEffect(() => {
    if (!arena.current || !exposer || !exposed) return;
    for (const [k, v] of Object.entries(exposed)) {
      const keys = k.split(".");
      exposer(keys, v);
    }
  }, [exposed, exposer]);

  useEffect(() => {
    if (!arena.current || !loaded || (!src && !sourceCode)) return;

    setIFrameState(s => (!s[0] && !s[1] ? s : ["", undefined]));
    // load JS
    (async () => {
      if (!arena.current) return;
      const code = sourceCode ?? (src ? await (await fetch(src)).text() : "");
      evalCode(code);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, sourceCode, loaded]); // ignore evalCode

  return {
    iFrameHtml,
    iFrameRef,
    iFrameVisible: iFrameOptions?.visible,
    loaded,
  };
}
