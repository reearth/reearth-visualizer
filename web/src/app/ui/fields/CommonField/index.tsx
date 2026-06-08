import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode, useEffect, useState } from "react";

export interface CommonFieldProps {
  title?: string;
  description?: string | ReactNode;
  dataTestId?: string;
  // Decoration slots for conditional UI elements
  titleAdornment?: ReactNode; // Icon/badge displayed next to title
  beforeInput?: ReactNode; // Warning/info displayed before input
  afterInput?: ReactNode; // Helper text/status displayed after input
  highlight?: boolean; // Trigger highlight animation
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  title,
  titleAdornment,
  beforeInput,
  description,
  children,
  afterInput,
  highlight,
  ...props
}) => {
  const theme = useTheme();
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (highlight) {
      setIsHighlighting(true);
      // Remove highlight after animation completes
      const timer = setTimeout(() => {
        setIsHighlighting(false);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [highlight]);

  return (
    <Wrapper
      data-testid="commonfield-wrapper"
      $highlight={isHighlighting}
      {...props}
    >
      {title && (
        <TitleRow data-testid="commonfield-title-row">
          <Typography size="body" data-testid="commonfield-title">
            {title}
          </Typography>
          {titleAdornment && (
            <TitleAdornmentWrapper data-testid="commonfield-title-adornment">
              {titleAdornment}
            </TitleAdornmentWrapper>
          )}
        </TitleRow>
      )}
      {beforeInput && (
        <BeforeInputWrapper data-testid="commonfield-before-input">
          {beforeInput}
        </BeforeInputWrapper>
      )}
      {children}
      {afterInput && (
        <AfterInputWrapper data-testid="commonfield-after-input">
          {afterInput}
        </AfterInputWrapper>
      )}
      {typeof description === "string" ? (
        <Typography
          size="footnote"
          color={theme.content.weak}
          data-testid="commonfield-description"
        >
          {description}
        </Typography>
      ) : (
        description
      )}
    </Wrapper>
  );
};

export default CommonField;

const Wrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "$highlight"
})<{ $highlight?: boolean }>(({ theme, $highlight }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  ...theme.scrollBar,
  position: "relative",
  ...($highlight && {
    "& > *:nth-of-type(2)": {
      // Target the input field (second child after title)
      animation: "border-pulse 1s ease-in-out",
      "@keyframes border-pulse": {
        "0%": {
          boxShadow: `0 0 0 0px ${theme.primary.main}`
        },
        "15%": {
          boxShadow: `0 0 0 3px ${theme.primary.main}`
        },
        "30%": {
          boxShadow: `0 0 0 3px ${theme.primary.main}`
        },
        "100%": {
          boxShadow: `0 0 0 0px ${theme.primary.main}`
        }
      }
    }
  })
}));

const TitleRow = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  alignItems: css.alignItems.center,
  gap: "8px"
}));

const TitleAdornmentWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center
}));

const BeforeInputWrapper = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column
}));

const AfterInputWrapper = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column
}));
