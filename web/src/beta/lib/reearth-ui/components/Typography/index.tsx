import { useTheme } from "@reearth/services/theme";
import {
  FontSize,
  FontWeight,
  UniqueTraits,
  typography,
} from "@reearth/services/theme/reearthTheme/common/fonts";
import { FC, ReactNode, useMemo, CSSProperties } from "react";

type NonChangeableProperties =
  | "color"
  | "fontFamily"
  | "fontSize"
  | "lineHeight"
  | "fontStyle";

type ChangeableProperties = Omit<CSSProperties, NonChangeableProperties>;

export type TypographyProps = {
  children: ReactNode;
  size: FontSize;
  trait?: UniqueTraits;
  weight?: FontWeight;
  color?: string;
  className?: string;
  otherProperties?: Partial<ChangeableProperties>;
  onClick?: () => void;
};

export const Typography: FC<TypographyProps> = ({
  children,
  size,
  trait,
  weight = "regular",
  color,
  className,
  otherProperties,
  onClick,
}) => {
  const theme = useTheme();
  const themeTypographyBySize = typography[size];
  const ThemeTypography = useMemo(
    () =>
      trait && trait in themeTypographyBySize
        ? themeTypographyBySize[trait]
        : weight in themeTypographyBySize
          ? themeTypographyBySize[weight]
          : themeTypographyBySize[size === "h1" ? "bold" : "regular"],
    [trait, size, weight, themeTypographyBySize],
  );

  const memoizedStyle = useMemo(
    () => ({
      ...otherProperties,
      color: color || theme.content.main,
      textOverflow: "ellipsis",
      overflow: "hidden",
      flexShrink: 0,
    }),
    [otherProperties, theme.content.main, color],
  );

  return ThemeTypography ? (
    <ThemeTypography
      style={memoizedStyle}
      onClick={onClick}
      className={className}
    >
      {children}
    </ThemeTypography>
  ) : null;
};
