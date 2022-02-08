import React, { IframeHTMLAttributes } from "react";

import useHook, { RefType } from "./hooks";

export type Ref = RefType;

export type Props = {
  autoResize?: "both" | "width-only" | "height-only";
  className?: string;
  html?: string;
  visible?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  onLoad?: () => void;
  onMessage?: (message: any) => void;
  onClick?: () => void;
};

const IFrame: React.ForwardRefRenderFunction<Ref, Props> = (
  { autoResize, className, html, visible, iFrameProps, onLoad, onMessage, onClick },
  ref,
) => {
  const {
    ref: iFrameRef,
    props,
    onLoad: onIFrameLoad,
  } = useHook({
    visible,
    iFrameProps,
    autoResize,
    html,
    ref,
    onLoad,
    onMessage,
    onClick,
  });

  return html ? (
    <iframe
      frameBorder="no"
      scrolling={autoResize ? "no" : undefined}
      data-testid="iframe"
      srcDoc=""
      key={html}
      ref={iFrameRef}
      className={className}
      onLoad={onIFrameLoad}
      {...props}
    />
  ) : null;
};

export default React.forwardRef(IFrame);
