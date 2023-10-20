import { CSSProperties, ReactNode, useMemo } from "react";

import { useTheme } from "@reearth/services/theme";
import {
  FontWeight,
  typography,
  FontSize,
  UniqueTraits,
} from "@reearth/services/theme/reearthTheme/common/fonts";

type NonChangeableProperties = "color" | "fontFamily" | "fontSize" | "lineHeight" | "fontStyle";

type ChangeableProperties = Omit<CSSProperties, NonChangeableProperties>;

export type Props = {
  className?: string;
  children: ReactNode;
  color?: string;
  customColor?: boolean;
  size: FontSize;
  weight?: FontWeight;
  trait?: UniqueTraits;
  otherProperties?: Partial<ChangeableProperties>;
  onClick?: () => void;
  onDoubleClick?: () => void;
};

const Text: React.FC<Props> = ({
  className,
  children,
  size,
  color,
  customColor,
  weight = "regular",
  trait,
  otherProperties,
  onClick,
  onDoubleClick,
}) => {
  const theme = useTheme();
  const defaultColor = theme.content.main;
  const typographyBySize = typography[size];

  const Typography = useMemo(
    () =>
      trait && trait in typographyBySize
        ? typographyBySize[trait]
        : weight in typographyBySize
        ? typographyBySize[weight]
        : typographyBySize[size === "h1" ? "medium" : "regular"],
    [trait, size, typographyBySize, weight],
  );

  return Typography ? (
    <Typography
      className={className}
      style={{
        userSelect: "none",
        ...otherProperties,
        color: customColor ? undefined : color || defaultColor,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}>
      {children}
    </Typography>
  ) : null;
};

export default Text;
