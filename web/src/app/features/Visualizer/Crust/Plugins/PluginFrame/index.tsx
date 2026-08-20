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
import type { MutableRefObject, RefObject } from "react";

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
  uiContainerRef?: MutableRefObject<HTMLElement | null>;
  isMarshalable?: boolean | "json" | ((target: unknown) => boolean | "json");
  pluginContext: ReearthPluginContext;
  /**
   * Extension type - used to determine display behavior
   * storyBlock and infoboxBlock always use block display
   */
  extensionType?: string;
  /**
   * Widget extension settings - determines if widget fills available space
   * horizontally: widget fills full width of its alignment area
   * vertically: widget fills full height of its alignment area
   */
  extended?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
  onMessage?: (message: unknown) => void;
  onPreInit?: () => void;
  onError?: (err: unknown) => void;
  onDispose?: () => void;
  onClick?: () => void;
  onRender?: (type: string) => void;
  /**
   * Callback to register the modal close function.
   * Used by the close-before-show pattern to close previous modal
   * when a new plugin shows its modal.
   */
  onRegisterModalClose?: (closeFn: () => void) => void;
  /**
   * Callback to register the popup close function.
   * Used by the close-before-show pattern to close previous popup
   * when a new plugin shows its popup.
   */
  onRegisterPopupClose?: (closeFn: () => void) => void;
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
    autoResize,
    iFrameProps,
    uiContainerRef,
    isMarshalable,
    pluginContext,
    extensionType,
    extended,
    onPreInit,
    onError,
    onDispose,
    onClick,
    onMessage,
    onRender: _onRender,
    onRegisterModalClose,
    onRegisterPopupClose
  },
  ref
) => {
  const { loaded, surfaceRefs, modalElement, popupElement } = useZushiPlugin({
    src,
    sourceCode,
    skip,
    autoResize,
    isMarshalable,
    ref,
    pluginContext,
    onError,
    onPreInit,
    onDispose,
    onMessage,
    onRegisterModalClose,
    onRegisterPopupClose
  });

  // Populate UI container ref for popup positioning
  // Sync whenever the UI container or loaded state changes
  useEffect(() => {
    if (uiContainerRef && surfaceRefs.uiContainer.current) {
      uiContainerRef.current = surfaceRefs.uiContainer.current;
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
        /* UI surface iframe fills its container */
        .zushi-ui-surface-container iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        /* Modal and popup containers - let Zushi control dimensions, constrain to viewport */
        .zushi-modal-surface-container,
        .zushi-popup-surface-container {
          max-width: 100%;
          max-height: 100%;
        }
        .zushi-modal-surface-container iframe,
        .zushi-popup-surface-container iframe {
          border: none;
          display: block;
        }
      `}</style>

      {/* Main UI Surface Container */}
      <div
        ref={surfaceRefs.uiContainer}
        className={`zushi-ui-surface-container ${className || ""}`}
        style={{
          // storyBlock/infoboxBlock always use block, extended horizontally uses block, otherwise inline-block
          display: uiVisible
            ? extensionType === "storyBlock" ||
              extensionType === "infoboxBlock" ||
              extended?.horizontally
              ? "block"
              : "inline-block"
            : "none",
          // storyBlock/infoboxBlock and extended horizontally fill their area, non-extended size to content
          width:
            extensionType === "storyBlock" ||
            extensionType === "infoboxBlock" ||
            extended?.horizontally
              ? "100%"
              : undefined,
          height: extended?.vertically ? "100%" : undefined,
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
