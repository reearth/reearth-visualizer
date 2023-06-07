import {
  IframeHTMLAttributes,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { insertToBody } from "./utils";

export type RefType = {
  postMessage: (message: any) => void;
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
};

export type AutoResize = "both" | "width-only" | "height-only";

export default function useHook({
  autoResizeMessageKey = "___iframe_auto_resize___",
  width,
  height,
  html,
  ref,
  autoResize,
  visible,
  iFrameProps,
  onLoad,
  onMessage,
  onClick,
  onAutoResized,
}: {
  width?: number | string;
  height?: number | string;
  autoResizeMessageKey?: string;
  html?: string;
  ref?: Ref<RefType>;
  autoResize?: AutoResize;
  visible?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
  onClick?: () => void;
  onAutoResized?: () => void;
} = {}): {
  ref: RefObject<HTMLIFrameElement>;
  props: IframeHTMLAttributes<HTMLIFrameElement>;
  srcDoc: string;
  onLoad?: () => void;
} {
  const loaded = useRef(false);
  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const [iFrameSize, setIFrameSize] = useState<[string | undefined, string | undefined]>();
  const pendingMesages = useRef<any[]>([]);

  useImperativeHandle(
    ref,
    (): RefType => ({
      postMessage: message => {
        if (!loaded.current || !iFrameRef.current?.contentWindow) {
          pendingMesages.current.push(message);
          return;
        }
        iFrameRef.current.contentWindow.postMessage(message, "*");
      },
      resize: (width, height) => {
        const width2 = typeof width === "number" ? width + "px" : width ?? undefined;
        const height2 = typeof height === "number" ? height + "px" : height ?? undefined;
        setIFrameSize(width2 || height2 ? [width2, height2] : undefined);
      },
    }),
    [],
  );

  useEffect(() => {
    const cb = (ev: MessageEvent<any>) => {
      if (!iFrameRef.current || ev.source !== iFrameRef.current.contentWindow) return;
      if (ev.data?.[autoResizeMessageKey]) {
        const { width, height } = ev.data[autoResizeMessageKey];
        if (typeof width !== "number" || typeof height !== "number") return;
        setIFrameSize([width + "px", height + "px"]);
        onAutoResized?.();
      } else {
        onMessage?.(ev.data);
      }
    };
    window.addEventListener("message", cb);
    return () => {
      window.removeEventListener("message", cb);
    };
  }, [autoResize, autoResizeMessageKey, onMessage, onAutoResized]);

  const onIframeLoad = useCallback(() => {
    loaded.current = true;
    onLoad?.();
  }, [onLoad]);

  const props = useMemo<IframeHTMLAttributes<HTMLIFrameElement>>(
    () => ({
      ...iFrameProps,
      style: {
        display: visible ? "block" : "none",
        width: visible
          ? !autoResize || autoResize == "height-only"
            ? "100%"
            : iFrameSize?.[0]
          : "0px",
        height: visible
          ? !autoResize || autoResize == "width-only"
            ? "100%"
            : iFrameSize?.[1]
          : "0px",
        ...iFrameProps?.style,
      },
    }),
    [autoResize, iFrameProps, iFrameSize, visible],
  );

  useEffect(() => {
    const handleBlur = () => {
      if (iFrameRef.current && iFrameRef.current === document.activeElement) {
        onClick?.();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [onClick]);

  useEffect(() => {
    const w = typeof width === "number" ? width + "px" : width;
    const h = typeof height === "number" ? height + "px" : height;
    setIFrameSize(w || h ? [w, h] : undefined);
  }, [width, height]);

  const autoResizeScript = useMemo(() => {
    return `<script id="_reearth_resize">
      if ("ResizeObserver" in window) {         
        new window.ResizeObserver(entries => {
          const win = document.defaultView;
          const html = document.body.parentElement;
          const st = win.getComputedStyle(html, "");
          horizontalMargin = parseInt(st.getPropertyValue("margin-left"), 10) + parseInt(st.getPropertyValue("margin-right"), 10);
          verticalMargin = parseInt(st.getPropertyValue("margin-top"), 10) + parseInt(st.getPropertyValue("margin-bottom"), 10);
          const width = html.offsetWidth + horizontalMargin;
          const height = html.offsetHeight + verticalMargin;
          if(parent){
            parent.postMessage({
              [${JSON.stringify(autoResizeMessageKey)}]: { width, height }
            }, "*")
          }
        }).observe(document.body.parentElement);
      }
    </script>`;
  }, [autoResizeMessageKey]);

  const srcDoc = useMemo(() => {
    return insertToBody(html, autoResizeScript);
  }, [html, autoResizeScript]);

  return {
    ref: iFrameRef,
    props,
    srcDoc,
    onLoad: onIframeLoad,
  };
}
