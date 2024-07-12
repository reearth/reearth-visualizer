import { forwardRef, ForwardRefRenderFunction, IframeHTMLAttributes, ReactNode } from "react";
import type { RefObject } from "react";

import useHook, { defaultIsMarshalable, IFrameType, API, Ref } from "./hooks";
import PluginIFrame, { AutoResize } from "./PluginIFrame";

export { defaultIsMarshalable };

export type { AutoResize } from "./PluginIFrame";
export type { API, IFrameType, Ref } from "./hooks";

export type Props = {
  className?: string;
  uiVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  autoResize?: AutoResize;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  modalContainer?: HTMLElement | DocumentFragment;
  popupContainer?: HTMLElement | DocumentFragment;
  modalVisible?: boolean;
  popupVisible?: boolean;
  externalRef?: RefObject<HTMLIFrameElement>;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  exposed?: ((api: API) => { [key: string]: any }) | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onRender?: (type: IFrameType) => void;
};

const Plugin: ForwardRefRenderFunction<Ref, Props> = (
  {
    className,
    uiVisible,
    modalVisible,
    popupVisible,
    skip,
    src,
    sourceCode,
    renderPlaceholder,
    autoResize,
    iFrameProps,
    isMarshalable,
    modalContainer,
    popupContainer,
    externalRef,
    exposed,
    onPreInit,
    onError,
    onDispose,
    onClick,
    onMessage,
    onRender,
  },
  ref,
) => {
  const { mainIFrameRef, modalIFrameRef, popupIFrameRef, loaded, handleMessage } = useHook({
    src,
    sourceCode,
    skip,
    isMarshalable,
    ref,
    exposed,
    onError,
    onPreInit,
    onDispose,
    onMessage,
  });

  return (
    <>
      <PluginIFrame
        type="main"
        ref={mainIFrameRef}
        ready={loaded}
        visible={uiVisible}
        enabled
        className={className}
        iFrameProps={iFrameProps}
        autoResize={autoResize}
        renderPlaceholder={renderPlaceholder}
        externalRef={externalRef}
        onClick={onClick}
        onRender={onRender as (type: string) => void}
        onMessage={handleMessage}
      />
      <PluginIFrame
        type="modal"
        ref={modalIFrameRef}
        container={modalContainer}
        visible
        enabled={modalVisible}
        ready={loaded}
        autoResize="both"
        onRender={onRender as (type: string) => void}
        onMessage={handleMessage}
      />
      <PluginIFrame
        type="popup"
        ref={popupIFrameRef}
        container={popupContainer}
        visible
        enabled={popupVisible}
        ready={loaded}
        autoResize="both"
        onRender={onRender as (type: string) => void}
        onMessage={handleMessage}
      />
    </>
  );
};

export default forwardRef(Plugin);
