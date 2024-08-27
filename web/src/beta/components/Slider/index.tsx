import { styled } from "@reearth/services/theme";
import RCSlider from "rc-slider";
import React, { ComponentProps } from "react";

import "rc-slider/assets/index.css";

const SliderWithTooltip = RCSlider.createSliderWithTooltip(RCSlider);

export type Props = {
  min?: number;
  max?: number;
} & ComponentProps<typeof SliderWithTooltip>;

const Slider: React.FC<Props> = ({ ...props }) => {
  const calculatedStep = props.step
    ? props.step
    : props.max
      ? props.max / 10
      : 0.1;
  return (
    <SliderStyled disabled={props.disabled as boolean}>
      <SliderWithTooltip step={calculatedStep} {...props} />
    </SliderStyled>
  );
};

const SliderStyled = styled.div<{ disabled: boolean }>`
  width: 100%;
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
    box-shadow: ${({ theme }) => theme.shadow.input};
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
    box-shadow: ${({ theme }) => theme.shadow.button};
  }
`;

export default Slider;
