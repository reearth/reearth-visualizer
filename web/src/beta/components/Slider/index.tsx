import RCSlider from "rc-slider";
import React, { ComponentProps } from "react";

import { styled } from "@reearth/services/theme";

import "rc-slider/assets/index.css";

export type Props = {
  min: number;
  max: number;
} & Omit<ComponentProps<typeof RCSlider>, "defaultValue">;

// TODO: Show tooltip on hover and drag
const Slider: React.FC<Props> = ({ ...props }) => (
  <SliderWrapper>
    <StyledSlider {...props} />
  </SliderWrapper>
);

const SliderWrapper = styled.div`
  border: 1px solid red;
`;

const StyledSlider = styled(RCSlider)`
  .rc-slider-rail {
    height: 8px;
  }

  .rc-slider-handle {
    background-color: ${({ theme }) => theme.item.default};
    border: ${({ theme }) => theme.primary.weak};
    height: 12px;
    width: 12px;
    margin-top: -2px;
  }

  .rc-slider-track {
    background-color: ${({ theme }) => theme.primary.weak};
    height: 8px;
  }

  .rc-slider-rail {
    background-color: ${({ theme }) => theme.outline.weaker};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  }

  .rc-slider-handle:focus {
    box-shadow: none;
  }
  background-color: transparent;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  cursor: ${({ disabled }) => (disabled ? "not-allowd" : "inherit")};
`;

export default Slider;
