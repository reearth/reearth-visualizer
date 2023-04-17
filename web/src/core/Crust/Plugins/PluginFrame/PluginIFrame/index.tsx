import { forwardRef, ForwardRefRenderFunction, IframeHTMLAttributes, ReactNode, memo } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";

import IFrame, { AutoResize } from "../IFrame";

import useHooks, { Ref } from "./hooks";

export type { AutoResize } from "../IFrame";
export type { IFrameAPI, Ref } from "./hooks";

export type Props = {
  className?: string;
  type: string;
  visible?: boolean;
  ready?: boolean;
  enabled?: boolean;
  autoResize?: AutoResize;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  renderPlaceholder?: ReactNode;
  container?: HTMLElement | DocumentFragment;
  externalRef?: RefObject<HTMLIFrameElement>;
  onRender?: (type: string) => void;
  onClick?: () => void;
  onMessage?: (message: any) => void;
};

const PluginIFrame: ForwardRefRenderFunction<Ref, Props> = (
  {
    className,
    type,
    visible,
    ready,
    enabled,
    autoResize,
    iFrameProps,
    renderPlaceholder,
    container,
    externalRef,
    onRender,
    onClick,
    onMessage,
  },
  ref,
) => {
  const {
    ref: iFrameRef,
    html,
    options,
    handleLoad,
  } = useHooks({ ready, ref, visible, type, enabled, onRender });

  const children = (
    <>
      {html ? (
        <IFrame
          ref={iFrameRef}
          className={className}
          iFrameProps={iFrameProps}
          html={html}
          autoResize={autoResize}
          externalRef={externalRef}
          onMessage={onMessage}
          onClick={onClick}
          onLoad={handleLoad}
          {...options}
        />
      ) : renderPlaceholder ? (
        <>{renderPlaceholder}</>
      ) : null}
    </>
  );

  return enabled ? (container ? createPortal(children, container) : children) : null;
};

export default memo(forwardRef(PluginIFrame));
