import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "quickjs-emscripten-sync";
import { useCallback, useEffect, useRef, useState, useMemo, useImperativeHandle, Ref } from "react";

import type { Ref as IFrameRef } from "./IFrame";

export type IFrameAPI = {
  render: (
    html: string,
    options?: { visible?: boolean; width?: number | string; height?: number | string },
  ) => void;
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  postMessage: (message: any) => void;
};

export type RefType = {
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  arena: () => Arena | undefined;
};

export type Options = {
  src?: string;
  sourceCode?: string;
  skip?: boolean;
  iframeCanBeVisible?: boolean;
  isMarshalable?: boolean | "json" | ((obj: any) => boolean | "json");
  ref?: Ref<RefType>;
  onError?: (err: any) => void;
  onPreInit?: () => void;
  onDispose?: () => void;
  exposed?: ((api: IFrameAPI) => { [key: string]: any }) | { [key: string]: any };
};

// restrict any classes
export const defaultIsMarshalable = (obj: any): boolean => {
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

export default function useHook({
  src,
  sourceCode,
  skip,
  iframeCanBeVisible,
  isMarshalable,
  ref,
  onPreInit,
  onError = defaultOnError,
  onDispose,
  exposed,
}: Options = {}) {
  const arena = useRef<Arena | undefined>();
  const eventLoop = useRef<number>();
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const iFrameRef = useRef<IFrameRef>(null);
  const [[iFrameHtml, iFrameOptions], setIFrameState] = useState<
    [string, { visible?: boolean; width?: number | string; height?: number | string } | undefined]
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
      resize: (width, height) => {
        iFrameRef.current?.resize(width, height);
      },
      postMessage: msg => {
        iFrameRef.current?.postMessage(JSON.parse(JSON.stringify(msg)));
      },
    }),
    [iframeCanBeVisible],
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

    onPreInit?.();

    (async () => {
      const vm = (await getQuickJS()).createVm();
      arena.current = new Arena(vm, {
        isMarshalable: target =>
          defaultIsMarshalable(target) ||
          (typeof isMarshalable === "function" ? isMarshalable(target) : "json"),
      });

      const e = typeof exposed === "function" ? exposed(iFrameApi) : exposed;
      if (e) {
        arena.current.expose(e);
      }

      evalCode(code);
      setLoaded(true);
    })();

    return () => {
      onDispose?.();
      setIFrameState(["", undefined]);
      if (typeof eventLoop.current === "number") {
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
  }, [code, evalCode, iFrameApi, isMarshalable, onDispose, onPreInit, skip, exposed]);

  useImperativeHandle(
    ref,
    (): RefType => ({
      resize: (width, height) => {
        iFrameRef.current?.resize(width, height);
      },
      arena: () => arena.current,
    }),
    [],
  );

  return {
    iFrameHtml,
    iFrameRef,
    iFrameVisible: iFrameOptions?.visible,
    loaded,
  };
}
