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

export type RefType = {
  postMessage: (message: any) => void;
};

export default function useHook({
  autoResizeMessageKey = "___iframe_auto_resize___",
  html,
  ref,
  autoResize,
  visible,
  iFrameProps,
  onLoad,
  onMessage,
  onClick,
}: {
  autoResizeMessageKey?: string;
  html?: string;
  ref?: Ref<RefType>;
  autoResize?: "both" | "width-only" | "height-only";
  visible?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
  onClick?: () => void;
} = {}): {
  ref: RefObject<HTMLIFrameElement>;
  props: IframeHTMLAttributes<HTMLIFrameElement>;
  onLoad?: () => void;
} {
  const loaded = useRef(false);
  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const [iFrameSize, setIFrameSize] = useState<[string, string]>();
  const pendingMesages = useRef<any[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      postMessage: (message: any) => {
        if (!loaded.current || !iFrameRef.current?.contentWindow) {
          pendingMesages.current.push(message);
          return;
        }
        iFrameRef.current.contentWindow.postMessage(message, "*");
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
      } else {
        onMessage?.(ev.data);
      }
    };
    window.addEventListener("message", cb);
    return () => {
      window.removeEventListener("message", cb);
    };
  }, [autoResize, autoResizeMessageKey, onMessage]);

  const onIframeLoad = useCallback(() => {
    const win = iFrameRef.current?.contentWindow;
    const doc = iFrameRef.current?.contentDocument;
    if (!win || !doc?.body || !html) return;

    // inject auto-resizing code
    if (!doc.head.querySelector("script[id=_reearth_resize]")) {
      const resize = document.createElement("script");
      resize.id = "_reearth_resize";
      // To include margin, getComputedStyle should be used.
      resize.textContent = `
        if ("ResizeObserver" in window) {
          new window.ResizeObserver(entries => {
            const el = document.body.parentElement;
            const st = document.defaultView.getComputedStyle(el, "");
            horizontalMargin = parseInt(st.getPropertyValue("margin-left")) + parseInt(st.getPropertyValue("margin-right"));
            verticalMargin = parseInt(st.getPropertyValue("margin-top")) + parseInt(st.getPropertyValue("margin-bottom"));
            const resize = {
              width: el.offsetWidth + horizontalMargin,
              height: el.offsetHeight + verticalMargin,
            };
            parent.postMessage({
              [${JSON.stringify(autoResizeMessageKey)}]: resize
            })
          }).observe(document.body.parentElement);
        }
      `;
      doc.head.appendChild(resize);
    }

    doc.body.innerHTML = html;

    // exec scripts
    Array.from(doc.body.querySelectorAll("script"))
      .map<[HTMLScriptElement, HTMLScriptElement]>(oldScript => {
        const newScript = document.createElement("script");
        for (const attr of Array.from(oldScript.attributes)) {
          newScript.setAttribute(attr.name, attr.value);
        }
        newScript.appendChild(document.createTextNode(oldScript.innerText));
        return [oldScript, newScript];
      })
      .forEach(([oldScript, newScript]) => {
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

    // post pending messages
    if (pendingMesages.current.length) {
      for (const msg of pendingMesages.current) {
        win.postMessage(msg, "*");
      }
      pendingMesages.current = [];
    }

    loaded.current = true;
    onLoad?.();
  }, [autoResizeMessageKey, html, onLoad]);

  const props = useMemo<IframeHTMLAttributes<HTMLIFrameElement>>(
    () => ({
      style: {
        display: visible ? undefined : "none",
        // TODO: width iFrameSize?.[0]
        width: visible
          ? autoResize == "height-only" || autoResize == "both"
            ? "100%"
            : iFrameSize?.[0]
          : "0px",
        height: visible
          ? autoResize == "width-only" || autoResize == "both"
            ? "100%"
            : iFrameSize?.[1]
          : "0px",
        minWidth: "100%",
        maxWidth: "100%",
        ...iFrameProps?.style,
      },
      ...iFrameProps,
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

  return {
    ref: iFrameRef,
    props,
    onLoad: onIframeLoad,
  };
}
