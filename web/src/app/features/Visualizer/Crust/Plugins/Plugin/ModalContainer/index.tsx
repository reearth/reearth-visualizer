import { styled } from "@reearth/services/theme";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useImperativeHandle,
  useCallback
} from "react";

export type PluginModalInfo = {
  id?: string;
  background?: string;
  clickBgToClose?: boolean;
};

type Props = {
  onPluginModalShow: (modalInfo?: PluginModalInfo) => void;
  shownPluginModalInfo?: PluginModalInfo;
};

const ModalContainer: ForwardRefRenderFunction<
  HTMLDivElement | undefined,
  Props
> = ({ onPluginModalShow, shownPluginModalInfo }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const handleModalClose = useCallback(() => {
    if (shownPluginModalInfo?.clickBgToClose) {
      onPluginModalShow?.();
    }
  }, [shownPluginModalInfo?.clickBgToClose, onPluginModalShow]);

  return (
    <>
      <Background
        visible={
          !!shownPluginModalInfo?.id &&
          !!shownPluginModalInfo?.background &&
          shownPluginModalInfo?.background !== "none"
        }
        background={shownPluginModalInfo?.background}
        onClick={handleModalClose}
      />
      <Wrapper visible={!!shownPluginModalInfo?.id} ref={innerRef} />
    </>
  );
};

const Wrapper = styled("div")<{ visible: boolean }>(({ visible, theme }) => ({
  position: "absolute",
  left: "50%",
  top: " 50%",
  transform: "translate(-50%, -50%)",
  visibility: visible ? "visible" : "hidden",
  zIndex: visible
    ? theme.zIndexes.visualizer.pluginModal
    : theme.zIndexes.hidden,
  transition: "opacity 0.25s",
  opacity: visible ? "1" : "0"
}));

const Background = styled("div")<{ visible: boolean; background?: string }>(
  ({ visible, background, theme }) => ({
    display: "block",
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    background: background,
    visibility: visible ? "visible" : "hidden",
    zIndex: visible
      ? theme.zIndexes.visualizer.pluginModal
      : theme.zIndexes.hidden
  })
);

export default forwardRef(ModalContainer);
