import React from "react";
import { RingLoader } from "react-spinners";

import { styled, useTheme } from "@reearth/services/theme";

import Portal from "../Portal";

export type Props = {
  className?: string;
  animationSize?: number;
  animationColor?: string;
  portal?: boolean;
  fixed?: boolean;
  relative?: boolean;
  overlay?: boolean;
};

const Loading: React.FC<Props> = ({
  className,
  animationSize,
  animationColor,
  portal,
  fixed,
  relative,
  overlay,
}) => {
  const theme = useTheme();
  const loading = (
    <LoadingWrapper className={className} fixed={fixed} overlay={overlay} relative={relative}>
      <RingLoader size={animationSize ?? 33} color={animationColor ?? theme.select.main} />
    </LoadingWrapper>
  );
  return portal ? <Portal>{loading}</Portal> : loading;
};

const LoadingWrapper = styled.div<{ fixed?: boolean; overlay?: boolean; relative?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  position: ${({ fixed, relative }) => (fixed ? "fixed" : relative ? "relative" : "absolute")};
  top: 0;
  left: 0;
  background: ${({ overlay, theme }) => (overlay ? theme.bg[0] : null)};
  opacity: 0.8;
  z-index: ${props => props.theme.zIndexes.editor.loading};
`;

export default Loading;
