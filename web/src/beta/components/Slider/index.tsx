import RCSlider from "rc-slider";
import React, { ComponentProps } from "react";

import { styled } from "@reearth/services/theme";

import "rc-slider/assets/index.css";

export type Props = {
  min: number;
  max: number;
} & Omit<ComponentProps<typeof RCSlider>, "defaultValue">;

const SliderWithTooltip = RCSlider.createSliderWithTooltip(RCSlider);

const Slider: React.FC<Props> = ({ ...props }) => (
  <SliderStyled disabled={props.disabled as boolean}>
    <SliderWithTooltip {...props} />
  </SliderStyled>
);

const SliderStyled = styled.div<{ disabled: boolean }>`
  .rc-slider-disabled {
    background-color: transparent;
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "inherit")};
  }

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

  .rc-slider-tooltip-arrow {
    background-color: transparent;
    border-top-color: ${({ theme }) => theme.bg[2]};
    bottom: 2px;
    margin-left: -8px;
    border-width: 9px 8px 0;
  }

  .rc-slider-tooltip-inner {
    background-color: ${({ theme }) => theme.bg[2]};
    color: ${({ theme }) => theme.content.main};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
  }
`;

export default Slider;
