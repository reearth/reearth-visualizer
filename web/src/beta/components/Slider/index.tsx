import RCSlider from "rc-slider";
import React, { ComponentProps } from "react";

import { styled, css } from "@reearth/services/theme";

import "rc-slider/assets/index.css";

export type Props = {
  min: number;
  max: number;
  frame?: boolean;
} & Omit<ComponentProps<typeof RCSlider>, "defaultValue">;

const Slider: React.FC<Props> = ({ frame = false, ...props }) => (
  <Wrapper frame={frame}>
    <StyledSlider {...props} />
  </Wrapper>
);

const Wrapper = styled.div<{ frame: boolean }>`
  display: flex;
  align-items: center;
  border: ${({ frame, theme }) => (frame ? `solid 1px ${theme.outline.main}` : "none")};
  border-radius: 3px;
  background: ${({ frame, theme }) => (frame ? theme.bg[1] : "transparent")};
  width: 100%;
  flex: 1;
  box-sizing: border-box;
  ${({ frame }) =>
    frame &&
    css`
      padding: 6px 12px;
      margin-right: 5px;
    `};
`;

const StyledSlider = styled(RCSlider)`
  .rc-slider-handle {
    background-color: ${({ theme }) => theme.bg[2]};
    border: ${({ theme }) => theme.bg[2]};
  }

  .rc-slider-track {
    background-color: ${({ theme }) => theme.bg[2]};
  }

  .rc-slider-handle:focus {
    box-shadow: none;
  }
`;

export default Slider;
