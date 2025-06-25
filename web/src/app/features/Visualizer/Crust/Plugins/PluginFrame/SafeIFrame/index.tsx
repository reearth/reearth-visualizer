import composeRefs from "@seznam/compose-react-refs";
import {
  IframeHTMLAttributes,
  ForwardRefRenderFunction,
  forwardRef
} from "react";
import type { RefObject } from "react";

import useHook, { RefType, AutoResize as AutoResizeType } from "./hooks";

export type Ref = RefType;

export type AutoResize = AutoResizeType;

export type Props = {
  autoResize?: AutoResize;
  className?: string;
  html?: string;
  visible?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  width?: string | number;
  height?: string | number;
  externalRef?: RefObject<HTMLIFrameElement>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
  onClick?: () => void;
  onAutoResized?: () => void;
};

const IFrame: ForwardRefRenderFunction<Ref, Props> = (
  {
    autoResize,
    className,
    html,
    visible,
    iFrameProps,
    width,
    height,
    externalRef,
    onLoad,
    onMessage,
    onClick,
    onAutoResized
  },
  ref
) => {
  const {
    ref: iFrameRef,
    props,
    onLoad: onIFrameLoad,
    srcDoc
  } = useHook({
    width,
    height,
    visible,
    iFrameProps,
    autoResize,
    html,
    ref,
    onLoad,
    onMessage,
    onClick,
    onAutoResized
  });

  return html ? (
    <iframe
      frameBorder="no"
      scrolling={"no"}
      data-testid="iframe"
      srcDoc={srcDoc}
      key={html}
      ref={composeRefs(iFrameRef, externalRef)}
      className={className}
      onLoad={onIFrameLoad}
      sandbox="allow-scripts allow-downloads allow-popups"
      allow=""
      {...props}
    />
  ) : null;
};

export default forwardRef(IFrame);
