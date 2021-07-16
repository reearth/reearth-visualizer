import React from "react";
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

  const LocalIconComponent = Icons[icon as Icons];
  if (LocalIconComponent) {
    return (
      <IconComponent
        className={className}
        src={LocalIconComponent}
        color={color}
        size={size}
        onClick={onClick}
        alt={alt}
      />
    );
  }

  if (icon.split(".").pop() !== "svg") {
    return <ImageIconComponent src={icon} size={size} />;
  }

  return (
    <IconComponent
      className={className}
      src={icon}
      color={color}
      size={size}
      onClick={onClick}
      alt={alt}
    />
  );
};

// This is needed to avoid a type error between Emotion and ReactSVG props(emotion styled components need className)
export type ReactSVGProps = {
  className?: string;
  src: string | Icons;
  onClick?: () => void;
  alt?: string;
  color?: string;
};

const ReactSVGComponent: React.FC<ReactSVGProps> = ({ color, ...props }) => {
  return <ReactSVG {...props} style={{ color }} />;
};

const IconComponent = styled(ReactSVGComponent)<{ color?: string; size?: string | number }>`
  font-size: 0;
  svg {
    width: ${props => (typeof props.size === "number" ? `${props.size}px` : props.size)};
    height: ${props => (typeof props.size === "number" ? `${props.size}px` : props.size)};
  }
`;

const ImageIconComponent = styled.img<{ size?: string | number }>`
  width: ${({ size }) => size + "px"};
  height: ${({ size }) => size + "px"};
`;

export default Icon;
