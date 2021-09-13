import React from "react";
import { RingLoader } from "react-spinners";

import { styled, useTheme } from "@reearth/theme";

import Portal from "../Portal";

export type Props = {
  portal?: boolean;
  fixed?: boolean;
  overlay?: boolean;
};

const Loading: React.FC<Props> = ({ portal, fixed, overlay }) => {
  const theme = useTheme();
  const loading = (
    <LoadingWrapper fixed={fixed} overlay={overlay}>
      <RingLoader size={33} color={theme.main.highlighted} />
    </LoadingWrapper>
  );
  return portal ? <Portal>{loading}</Portal> : loading;
};

const LoadingWrapper = styled.div<{ fixed?: boolean; overlay?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  position: ${({ fixed }) => (fixed ? "fixed" : "absolute")};
  top: 0;
  left: 0;
  background: ${props => (props.overlay ? props.theme.main.deepBg : null)};
  opacity: 0.8;
  z-index: ${props => props.theme.zIndexes.loading};
`;

export default Loading;
