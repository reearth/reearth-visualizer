import { computePosition, offset, autoUpdate } from "@floating-ui/dom";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useImperativeHandle,
  useEffect,
  RefObject,
} from "react";

import theme, { styled } from "@reearth/theme";

import type { PopupPosition } from "../../plugin_types";

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

const PopupContainer: ForwardRefRenderFunction<HTMLDivElement | undefined, Props> = (
  { shownPluginPopupInfo },
  ref,
) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  useEffect(() => {
    if (!shownPluginPopupInfo?.ref?.current || !innerRef.current) return;
    return autoUpdate(shownPluginPopupInfo?.ref?.current, innerRef.current, () => {
      if (!shownPluginPopupInfo?.ref?.current || !innerRef.current) return;
      computePosition(shownPluginPopupInfo?.ref?.current, innerRef.current, {
        placement: shownPluginPopupInfo.position ?? "bottom-start",
        middleware: [offset(shownPluginPopupInfo.offset ?? 0)],
      }).then(({ x, y }) => {
        if (innerRef.current) {
          innerRef.current.style.left = `${x}px`;
          innerRef.current.style.top = `${y}px`;
        }
      });
    });
  }, [shownPluginPopupInfo]);

  return <Wrapper visible={!!shownPluginPopupInfo?.id} ref={innerRef} />;
};

const Wrapper = styled.div<{ visible: boolean }>`
  position: absolute;
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  z-index: ${({ visible }) => (visible ? theme.zIndexes.pluginPopup : theme.zIndexes.hidden)};
  transition: opacity 0.25s;
  opacity: ${({ visible }) => (visible ? "1" : "0")};
`;

export default forwardRef(PopupContainer);
