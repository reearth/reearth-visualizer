import { styled } from "@reearth/theme";

type Props = {
  show?: boolean;
};

const Overlay = styled.div<Props>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${props => props.theme.modal.overlayBg};
  opacity: ${({ show }) => (show ? 0.3 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  transition: all 0.2s;
  transition-timing-function: ${({ show }) => (show ? "ease-in" : "ease-out")};
  z-index: ${props => props.theme.zIndexes.base};
  top: 0;
  left: 0;
`;

export default Overlay;
