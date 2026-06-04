import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";

export interface CommonFieldProps {
  title?: string;
  description?: string | ReactNode;
  dataTestId?: string;
  // Decoration slots for conditional UI elements
  titleAdornment?: ReactNode;  // Icon/badge displayed next to title
  beforeInput?: ReactNode;     // Warning/info displayed before input
  afterInput?: ReactNode;      // Helper text/status displayed after input
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  title,
  titleAdornment,
  beforeInput,
  description,
  children,
  afterInput,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Wrapper data-testid="commonfield-wrapper" {...props}>
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

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  ...theme.scrollBar
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
