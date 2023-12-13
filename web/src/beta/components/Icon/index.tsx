import svgToMiniDataURI from "mini-svg-data-uri";
import React, { AriaAttributes, AriaRole, CSSProperties, MouseEvent, memo, useMemo } from "react";
import SVG from "react-inlinesvg";

import { ariaProps } from "@reearth/beta/utils/aria";
import { styled } from "@reearth/services/theme";

import Icons from "./icons";

export type Icons = keyof typeof Icons;

export type Props = {
  className?: string;
  icon?: string | Icons;
  size?: number;
  color?: string;
  stroke?: string;
  style?: CSSProperties;
  role?: AriaRole;
  notransition?: boolean;
  transitionDuration?: string;
  onClick?: (e?: MouseEvent<Element>) => void;
} & AriaAttributes;

const Icon: React.FC<Props> = ({
  className,
  icon,
  style,
  color,
  stroke,
  size,
  role,
  notransition,
  transitionDuration,
  onClick,
  ...props
}) => {
  const src = useMemo(
    () => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : Icons[icon as Icons]),
    [icon],
  );
  if (!icon) return null;

  const aria = ariaProps(props);

  return (
    <StyledSvg
      className={className}
      src={src}
      role={role}
      color={color}
      stroke={stroke}
      size={size}
      onClick={onClick}
      style={{
        ...style,
        // To prevent annoying errors from being output to the console, specify transitions without Emotion.
        transitionDuration:
          !notransition && !style?.transitionDuration
            ? transitionDuration || "0.3s"
            : style?.transitionDuration,
      }}
      {...aria}
    />
  );
};

const StyledSvg = styled(SVG)<{
  color?: string;
  stroke?: string;
  size?: number;
}>`
  font-size: 0;
  display: inline-block;
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
  color: ${({ color }) => color};
  ${({ stroke }) => stroke && `stroke: ${stroke};`}
  transition-property: color, background;
`;

export default memo(Icon);
