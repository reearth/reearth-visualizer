import RCSlider from "rc-slider";
import React, { ComponentProps } from "react";

import { styled } from "@reearth/services/theme";

import "rc-slider/assets/index.css";

export type Props = {
  min: number;
  max: number;
} & Omit<ComponentProps<typeof RCSlider>, "defaultValue">;

// TODO: Show value on hover as well as on drag
const Slider: React.FC<Props> = ({ ...props }) => <StyledSlider {...props} />;

// TODO: Update colors as per design
// TODO: Add shadow background in the empty bar
// TODO: Update height as per design
// TODO: Fixed disabled state with opacity changes
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
