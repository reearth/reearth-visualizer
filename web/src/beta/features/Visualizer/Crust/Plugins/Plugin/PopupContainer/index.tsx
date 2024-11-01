import { computePosition, offset, autoUpdate } from "@floating-ui/dom";
import { styled } from "@reearth/services/theme";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useImperativeHandle,
  useEffect,
  RefObject
} from "react";

import type { PopupPosition } from "../../pluginAPI/types";

type AxesOffsets = {
  mainAxis?: number;
  crossAxis?: number;
  alignmentAxis?: number | null;
};

export type PluginPopupInfo = {
  id?: string;
  position?: PopupPosition;
  offset?: number | AxesOffsets;
  ref?: RefObject<HTMLIFrameElement>;
};

type Props = {
  shownPluginPopupInfo?: PluginPopupInfo;
};

const PopupContainer: ForwardRefRenderFunction<
  HTMLDivElement | undefined,
  Props
> = ({ shownPluginPopupInfo }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  useEffect(() => {
    if (!shownPluginPopupInfo?.ref?.current || !innerRef.current) return;
    return autoUpdate(
      shownPluginPopupInfo?.ref?.current,
      innerRef.current,
      () => {
        if (!shownPluginPopupInfo?.ref?.current || !innerRef.current) return;
        computePosition(shownPluginPopupInfo?.ref?.current, innerRef.current, {
          placement: shownPluginPopupInfo.position ?? "bottom-start",
          middleware: [offset(shownPluginPopupInfo.offset ?? 0)]
        }).then(({ x, y }) => {
          if (innerRef.current) {
            innerRef.current.style.left = `${x}px`;
            innerRef.current.style.top = `${y}px`;
          }
        });
      }
    );
  }, [shownPluginPopupInfo]);

  return <Wrapper visible={!!shownPluginPopupInfo?.id} ref={innerRef} />;
};

const Wrapper = styled("div")<{ visible: boolean }>(({ visible, theme }) => ({
  position: "absolute",
  visibility: visible ? "visible" : "hidden",
  zIndex: visible
    ? theme.zIndexes.visualizer.pluginPopup
    : theme.zIndexes.hidden,
  transition: "opacity 0.25s",
  opacity: visible ? "1" : "0"
}));

export default forwardRef(PopupContainer);
