import svgToMiniDataURI from "mini-svg-data-uri";
import React, { ComponentProps, CSSProperties, memo, useMemo } from "react";
import { ReactSVG } from "react-svg";

import { styled } from "@reearth/theme";

import Icons from "./icons";

export type Icons = keyof typeof Icons;

export type Props = {
  className?: string;
  icon?: string;
  size?: string | number;
  alt?: string;
  color?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

const Icon: React.FC<Props> = ({ className, icon, alt, style, color, size, onClick }) => {
  const src = useMemo(
    () => (icon?.startsWith("<svg ") ? svgToMiniDataURI(icon) : Icons[icon as Icons]),
    [icon],
  );
  if (!icon) return null;

  const sizeStr = typeof size === "number" ? `${size}px` : size;
  if (!src) {
    return <StyledImg src={icon} alt={alt} style={style} size={sizeStr} onClick={onClick} />;
  }

  return (
    <StyledSvg
      className={className}
      src={src}
      color={color}
      style={style}
      alt={alt}
      size={sizeStr}
      onClick={onClick}
    />
  );
};

const StyledImg = styled.img<{ size?: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const SVG: React.FC<
  Pick<ComponentProps<typeof ReactSVG>, "className" | "src" | "onClick" | "alt" | "style">
> = props => {
  return <ReactSVG {...props} wrapper="span" />;
};

const StyledSvg = styled(SVG)<{ color?: string; size?: string }>`
  font-size: 0;
  color: ${({ color }) => color};
  display: inline-block;

  svg {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`;

export default memo(Icon);
