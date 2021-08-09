import React, { ComponentProps, memo } from "react";
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
  onClick?: () => void;
};

const Icon: React.FC<Props> = ({ className, icon, color, size, alt, onClick }) => {
  if (!icon) return null;

  const sizeStr = typeof size === "number" ? `${size}px` : size;
  const builtin = Icons[icon as Icons];
  if (!builtin) {
    return <StyledImg src={icon} alt={alt} size={sizeStr} onClick={onClick} />;
  }

  return (
    <StyledSvg
      className={className}
      src={builtin}
      color={color}
      size={sizeStr}
      onClick={onClick}
      alt={alt}
    />
  );
};

const StyledImg = styled.img<{ size?: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const SVG: React.FC<
  Pick<ComponentProps<typeof ReactSVG>, "className" | "src" | "onClick" | "alt">
> = props => {
  return <ReactSVG {...props} wrapper="span" />;
};

const StyledSvg = styled(SVG)<{ color?: string; size?: string }>`
  font-size: 0;
  color: ${({ color }) => color};
  svg {
    width: ${({ size }) => size};
    height: ${({ size }) => size};
  }
`;

export default memo(Icon);
