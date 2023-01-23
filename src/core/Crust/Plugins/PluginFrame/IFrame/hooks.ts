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
            const win = document.defaultView;
            const html = document.body.parentElement;
            const st = win.getComputedStyle(html, "");
            horizontalMargin = parseInt(st.getPropertyValue("margin-left"), 10) + parseInt(st.getPropertyValue("margin-right"), 10);
            verticalMargin = parseInt(st.getPropertyValue("margin-top"), 10) + parseInt(st.getPropertyValue("margin-bottom"), 10);
            const scrollbarW = win.innerWidth - html.offsetWidth;
            const width = ${
              width
                ? typeof width === "number"
                  ? `"${width}px"`
                  : `"${width}"`
                : "html.offsetWidth + horizontalMargin"
            };
            const height = ${
              height
                ? typeof height === "number"
                  ? `"${height}px"`
                  : `"${height}"`
                : "html.offsetHeight + verticalMargin"
            };
            parent.postMessage({
              [${JSON.stringify(autoResizeMessageKey)}]: { width, height }
            })
          }).observe(document.body.parentElement);
        }
      `;
      doc.head.appendChild(resize);
    }

    doc.body.innerHTML = html;

    linksToHead(doc, doc.body.querySelectorAll("link"));

    const onScriptsLoaded = () => {
      // post pending messages
      if (pendingMesages.current.length) {
        for (const msg of pendingMesages.current) {
          win.postMessage(msg, "*");
        }
        pendingMesages.current = [];
      }
      loaded.current = true;
      onLoad?.();
    };

    // exec scripts
    const scripts = doc.body.querySelectorAll("script");
    if (scripts) {
      execScripts(scripts, false)
        .finally(() => execScripts(scripts, true))
        .finally(onScriptsLoaded);
    } else {
      onScriptsLoaded();
    }
  }, [autoResizeMessageKey, html, onLoad, height, width]);

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
    setIFrameSize(w && h ? [w, h] : undefined);
  }, [width, height]);

  return {
    ref: iFrameRef,
    props,
    onLoad: onIframeLoad,
  };
}

function execScripts(scripts: Iterable<HTMLScriptElement>, asyncScript: boolean) {
  const isAsync = (script: HTMLScriptElement) =>
    script.getAttribute("type") === "module" ||
    script.getAttribute("async") ||
    script.getAttribute("defer");

  return Array.from(scripts)
    .filter(script => (asyncScript ? isAsync(script) : !isAsync(script)))
    .reduce((chain, oldScript) => {
      return chain.then(() => runScript(oldScript));
    }, Promise.resolve());
}

function runScript(oldScript: HTMLScriptElement) {
  return new Promise<void>((resolve, rejected) => {
    const newScript = document.createElement("script");
    for (const attr of Array.from(oldScript.attributes)) {
      newScript.setAttribute(attr.name, attr.value);
    }
    newScript.appendChild(document.createTextNode(oldScript.innerText));
    newScript.onload = () => resolve();
    newScript.onerror = () => rejected();
    oldScript.parentNode?.replaceChild(newScript, oldScript);
    if (!newScript.getAttribute("src")) {
      resolve();
    }
  });
}

function linksToHead(doc: Document, links: NodeListOf<HTMLLinkElement>) {
  for (const link of links) {
    const newLink = document.createElement("link");
    for (const attr of link.attributes) {
      newLink.setAttribute(attr.name, attr.value);
    }
    if (link.innerText) {
      newLink.appendChild(document.createTextNode(link.innerText));
    }
    doc.head.appendChild(newLink);
    doc.body.removeChild(link);
  }
}
