import { Placement } from "@floating-ui/react";
import Tooltip from "@reearth/beta/lib/reearth-ui/components/Tooltip";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import Icons from "./icons";

export type IconName = keyof typeof Icons;

export type IconProps = {
  icon: IconName;
  size?: "large" | "normal" | "small" | number;
  color?: string;
  className?: string;
  ariaLabel?: string;
  tooltipText?: string;
  offset?: number;
  placement?: Placement;
  dataTestId?: string;
};

export const Icon: FC<IconProps> = ({
  icon,
  size = "normal",
  color,
  className,
  ariaLabel,
  tooltipText,
  offset,
  placement,
  dataTestId = `icon-${icon}`
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

  const IconComponent = SvgIcon ? (
    <SvgIcon
      size={size}
      color={color}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel ? "true" : undefined}
      data-testid={dataTestId}
    />
  ) : null;

  return tooltipText && IconComponent ? (
    <Tooltip
      type="custom"
      text={tooltipText}
      icon={icon}
      offset={offset}
      iconColor={color}
      placement={placement}
      data-testid={`tooltip-${dataTestId}`}
    />
  ) : (
    IconComponent
  );
};
