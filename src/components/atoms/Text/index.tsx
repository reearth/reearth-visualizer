import React, { CSSProperties } from "react";

import { useTheme } from "@reearth/theme";
import { FontWeight, typography, TypographySize } from "@reearth/theme/fonts";

type NonChangeableProperties = "color" | "fontFamily" | "fontSize" | "lineHeight" | "fontStyle";

type ChangeableProperties = Omit<CSSProperties, NonChangeableProperties>;

export type TextProps = {
  className?: string;
  children: React.ReactNode;
  color?: string;
  customColor?: boolean;
  size: TypographySize;
  isParagraph?: boolean;
  weight?: FontWeight;
  otherProperties?: Partial<ChangeableProperties>;
  onClick?: () => void;
};

const Text: React.FC<TextProps> = ({
  className,
  children,
  size,
  color,
  customColor,
  isParagraph = false,
  weight = "normal",
  otherProperties,
  onClick,
}) => {
  const theme = useTheme();
  const defaultColor = theme.text.default;
  const typographyBySize = typography[size];

  // Default is "regular"
  const Typography = isParagraph
    ? "paragraph" in typographyBySize && typographyBySize.paragraph
    : weight === "bold" && "bold" in typographyBySize
    ? typographyBySize.bold
    : typographyBySize.regular;

  return Typography ? (
    <Typography
      className={className}
      style={{
        ...otherProperties,
        color: customColor ? undefined : color || defaultColor,
      }}
      onClick={onClick}>
      {children}
    </Typography>
  ) : null;
};

export default Text;
