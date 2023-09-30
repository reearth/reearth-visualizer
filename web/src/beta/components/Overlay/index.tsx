import { styled } from "@reearth/services/theme";

type Props = {
  show?: boolean;
  strong?: boolean;
};

const Overlay = styled.div<Props>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.bg[1]};
  opacity: ${({ show, strong }) => (show ? (strong ? 0.7 : 0.3) : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  transition: all 0.2s;
  transition-timing-function: ${({ show }) => (show ? "ease-in" : "ease-out")};
  z-index: 1;
  top: 0;
  left: 0;
`;

export default Overlay;
