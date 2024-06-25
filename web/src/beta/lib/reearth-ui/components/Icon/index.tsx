import React, { useMemo } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icons from "./icons";

export type IconName = keyof typeof Icons;

export type IconProps = {
  icon: IconName;
  size?: "large" | "normal" | "small";
  color?: string;
  className?: string;
};

export const Icon: React.FC<IconProps> = ({ icon, size = "normal", color, className }) => {
  const theme = useTheme();
  const SvgIcon = useMemo(() => {
    const SvgComponent = Icons[icon as IconName];
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

  return SvgIcon ? <SvgIcon size={size} color={color} className={className} /> : null;
};
