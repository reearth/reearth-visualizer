import { forwardRef, ForwardRefRenderFunction, IframeHTMLAttributes, ReactNode } from "react";
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
  useContainer?: boolean;
  container?: HTMLElement | DocumentFragment;
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
    useContainer,
    container,
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
  } = useHooks({ ready, ref, visible, type, onRender });

  const children = (
    <>
      {html ? (
        <IFrame
          ref={iFrameRef}
          className={className}
          iFrameProps={iFrameProps}
          html={html}
          autoResize={autoResize}
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

  return enabled
    ? container
      ? useContainer
        ? createPortal(children, container)
        : null
      : children
    : null;
};

export default forwardRef(PluginIFrame);
