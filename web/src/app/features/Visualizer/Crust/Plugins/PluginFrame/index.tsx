/**
 * PluginFrame Component - Zushi Version
 *
 * This is the updated version using Zushi instead of custom QuickJS.
 * It replaces the manual iframe management with Zushi's surface system.
 */

import {
  forwardRef,
  ForwardRefRenderFunction,
  IframeHTMLAttributes,
  ReactNode,
  useEffect
} from "react";
import type { RefObject } from "react";

import type { ReearthPluginContext } from "../pluginAPI/zushiAdapter";

import useZushiPlugin, { defaultIsMarshalable, Ref } from "./useZushiPlugin";

export { defaultIsMarshalable };
export type { Ref } from "./useZushiPlugin";

export type Props = {
  className?: string;
  uiVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  autoResize?: "both" | "width-only" | "height-only";
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  modalContainer?: HTMLElement | DocumentFragment | null;
  popupContainer?: HTMLElement | DocumentFragment | null;
  modalVisible?: boolean;
  popupVisible?: boolean;
  externalRef?: RefObject<HTMLIFrameElement | null>;
  uiContainerRef?: RefObject<HTMLElement | null>;
  isMarshalable?: boolean | "json" | ((target: unknown) => boolean | "json");
  pluginContext: ReearthPluginContext;
  onMessage?: (message: unknown) => void;
  onPreInit?: () => void;
  onError?: (err: unknown) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onRender?: (type: string) => void;
};

const PluginFrameZushi: ForwardRefRenderFunction<Ref, Props> = (
  {
    className,
    uiVisible,
    modalVisible: _modalVisible,
    popupVisible: _popupVisible,
    modalContainer,
    popupContainer,
    skip,
    src,
    sourceCode,
    renderPlaceholder,
    iFrameProps,
    uiContainerRef,
    isMarshalable,
    pluginContext,
    onPreInit,
    onError,
    onDispose,
    onClick,
    onMessage,
    onRender: _onRender
  },
  ref
) => {
  const { loaded, surfaceRefs, modalElement, popupElement } = useZushiPlugin({
    src,
    sourceCode,
    skip,
    isMarshalable,
    ref,
    pluginContext,
    onError,
    onPreInit,
    onDispose,
    onMessage
  });

  // Populate UI container ref for popup positioning
  // Sync whenever the UI container or loaded state changes
  useEffect(() => {
    if (uiContainerRef && surfaceRefs.uiContainer.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (uiContainerRef as any).current = surfaceRefs.uiContainer.current;
    }
  }, [uiContainerRef, surfaceRefs.uiContainer, loaded]);

  // Manually append modal element to portal container
  useEffect(() => {
    if (!modalContainer) return;
    modalContainer.appendChild(modalElement);
    return () => {
      if (modalContainer.contains(modalElement)) {
        modalContainer.removeChild(modalElement);
      }
    };
  }, [modalContainer, modalElement]);

  // Manually append popup element to portal container
  useEffect(() => {
    if (!popupContainer) return;
    popupContainer.appendChild(popupElement);
    return () => {
      if (popupContainer.contains(popupElement)) {
        popupContainer.removeChild(popupElement);
      }
    };
  }, [popupContainer, popupElement]);

  return (
    <>
      <style>{`
        /* Ensure Zushi iframes fill their containers */
        .zushi-ui-surface-container iframe,
        .zushi-modal-surface-container iframe,
        .zushi-popup-surface-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>

      {/* Main UI Surface Container */}
      <div
        ref={surfaceRefs.uiContainer}
        className={`zushi-ui-surface-container ${className || ""}`}
        style={{
          display: uiVisible ? "block" : "none",
          width: "100%",
          height: "100%",
          ...iFrameProps?.style
        }}
        onClick={onClick}
      />

      {/* Modal and popup containers are now managed manually via useEffect above */}

      {/* Render placeholder if not loaded */}
      {!loaded && renderPlaceholder}
    </>
  );
};

export default forwardRef(PluginFrameZushi);
