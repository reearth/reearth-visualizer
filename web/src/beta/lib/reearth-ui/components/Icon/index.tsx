import React, { useMemo } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icons from "./icons";

export type Icons = keyof typeof Icons;

export type IconProps = {
  icon: Icons;
  size?: "large" | "normal" | "small";
  color?: string;
};

export const Icon: React.FC<IconProps> = ({ icon, size = "normal", color }) => {
  const theme = useTheme();
  const SvgIcon = useMemo(() => {
    const SvgComponent = Icons[icon as Icons];
    if (!SvgComponent) return null;
    return styled(SvgComponent)<{
      color?: string;
      size: "large" | "normal" | "small";
    }>`
      width: ${({ size }) => `${theme.icon[size]}px`};
      height: ${({ size }) => `${theme.icon[size]}px`};
      color: ${({ color }) => color};
      transition-property: color, background;
    `;
  }, [icon, theme]);

  return SvgIcon ? <SvgIcon size={size} color={color} /> : null;
};
