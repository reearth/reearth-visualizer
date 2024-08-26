import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo } from "react";


import Icons from "./icons";

export type IconName = keyof typeof Icons;

export type IconProps = {
  icon: IconName;
  size?: "large" | "normal" | "small" | number;
  color?: string;
  className?: string;
};

export const Icon: FC<IconProps> = ({
  icon,
  size = "normal",
  color,
  className,
}) => {
  const theme = useTheme();
  const SvgIcon = useMemo(() => {
    const SvgComponent = Icons[icon as IconName];
    if (!SvgComponent) return null;
    return styled(SvgComponent)<{
      color?: string;
      size: "large" | "normal" | "small" | number;
    }>`
      width: ${({ size }) =>
        `${typeof size === "string" ? theme.icon[size] : size}px`};
      height: ${({ size }) =>
        `${typeof size === "string" ? theme.icon[size] : size}px`};
      color: ${({ color }) => color};
      transition-property: color, background;
    `;
  }, [icon, theme]);

  return SvgIcon ? (
    <SvgIcon size={size} color={color} className={className} />
  ) : null;
};
