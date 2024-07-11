import {
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useImperativeHandle,
  useCallback,
} from "react";

import { styled } from "@reearth/services/theme";

export type PluginModalInfo = {
  id?: string;
  background?: string;
};

type Props = {
  onPluginModalShow: (modalInfo?: PluginModalInfo) => void;
  shownPluginModalInfo?: PluginModalInfo;
};

const ModalContainer: ForwardRefRenderFunction<HTMLDivElement | undefined, Props> = (
  { onPluginModalShow, shownPluginModalInfo },
  ref,
) => {
  const innerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const handleModalClose = useCallback(() => {
    onPluginModalShow?.();
  }, [onPluginModalShow]);

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

const Wrapper = styled.div<{ visible: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  z-index: ${({ visible, theme }) =>
    visible ? theme.classic.zIndexes.pluginModal : theme.classic.zIndexes.hidden};
  transition: opacity 0.25s;
  opacity: ${({ visible }) => (visible ? "1" : "0")};
`;

const Background = styled.div<{ visible: boolean; background?: string }>`
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: ${({ background }) => background};
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
  z-index: ${({ visible, theme }) =>
    visible ? theme.classic.zIndexes.pluginModal - 1 : theme.classic.zIndexes.hidden};
`;

export default forwardRef(ModalContainer);
