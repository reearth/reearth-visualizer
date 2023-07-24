import svgToMiniDataURI from "mini-svg-data-uri";
import React, { AriaAttributes, AriaRole, CSSProperties, memo, useMemo } from "react";

import { ariaProps } from "@reearth/beta/utils/aria";
import { styled } from "@reearth/services/theme";

import { type Icon as IconType } from "./types";
import useDynamicSVGImport from "./useDynamicSVGImport";

export { type Icon } from "./types";

export type Props = {
  className?: string;
  icon?: IconType | string;
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
  const aria = ariaProps(props);
  const sizeStr = typeof size === "number" ? `${size}px` : size;

  const { SvgIcon } = useDynamicSVGImport(icon);

  const src = useMemo(() => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : null), [icon]);

  if (SvgIcon) {
    const StyledSvg = styled(SvgIcon)<{
      color?: string;
      stroke?: string;
      size?: string;
    }>`
      font-size: 0;
      display: inline-block;
      width: ${({ size }) => size};
      height: ${({ size }) => size};
      color: ${({ color }) => color};
      ${({ stroke }) => stroke && `stroke: ${stroke};`}
      transition-property: color, background;
    `;

    return (
      <StyledSvg
        className={className}
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
  }

  if (!src) return null;

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
};

const StyledImg = styled.img<{ size?: string; notransition?: boolean }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  ${({ notransition }) => !notransition && "transition: all 0.3s;"}
`;

export default memo(Icon);
