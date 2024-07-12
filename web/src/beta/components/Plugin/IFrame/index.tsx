import composeRefs from "@seznam/compose-react-refs";
import React, { IframeHTMLAttributes } from "react";
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

const IFrame: React.ForwardRefRenderFunction<Ref, Props> = (
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
    onAutoResized,
  },
  ref,
) => {
  const {
    ref: iFrameRef,
    props,
    onLoad: onIFrameLoad,
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
    onAutoResized,
  });

  return html ? (
    <iframe
      frameBorder="no"
      scrolling={autoResize ? undefined : "no"}
      data-testid="iframe"
      srcDoc=""
      key={html}
      ref={composeRefs(iFrameRef, externalRef)}
      className={className}
      onLoad={onIFrameLoad}
      {...props}
    />
  ) : null;
};

export default React.forwardRef(IFrame);
