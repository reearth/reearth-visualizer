import svgToMiniDataURI from "mini-svg-data-uri";
import React, { AriaAttributes, AriaRole, CSSProperties, memo, useMemo } from "react";
import SVG from "react-inlinesvg";

import { styled } from "@reearth/theme";
import { ariaProps } from "@reearth/util/aria";

import Icons from "./icons";

export type Icons = keyof typeof Icons;

export type Props = {
  className?: string;
  icon?: string;
  size?: string | number;
  alt?: string;
  color?: string;
  stroke?: string;
  style?: CSSProperties;
  role?: AriaRole;
  notransition?: boolean;
  transitionDuration?: string;
  onClick?: () => void;
} & AriaAttributes;

const Icon: React.FC<Props> = ({
  className,
  icon,
  alt,
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
  const sizeStr = typeof size === "number" ? `${size}px` : size;
  if (!src) {
    return (
      <StyledImg
        className={className}
        src={icon}
        alt={alt}
        style={style}
        role={role}
        size={sizeStr}
        notransition={notransition}
        onClick={onClick}
        {...aria}
      />
    );
  }

  return (
    <StyledSvg
      className={className}
      src={src}
      role={role}
      color={color}
      stroke={stroke}
      size={sizeStr}
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

const StyledImg = styled.img<{ size?: string; notransition?: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  ${({ notransition }) => !notransition && "transition: all 0.3s;"}
`;

const StyledSvg = styled(SVG)<{
  color?: string;
  stroke?: string;
  size?: string;
}>`
  font-size: 0;
  display: inline-block;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  color: ${({ color }) => color};
  ${({ stroke }) => `stroke: ${stroke};`}
  transition-property: color, background;
`;

export default memo(Icon);
