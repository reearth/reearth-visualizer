import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

export interface CommonFieldProps {
  title?: string;
  description?: string | ReactNode;
  dataTestId?: string;
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  title,
  description,
  children,
  ...props
}) => {
  const theme = useTheme();
  return (
    <Wrapper data-testid="commonfield-wrapper" {...props}>
      {title && (
        <Typography size="body" data-testid="commonfield-title">
          {title}
        </Typography>
      )}
      {children}
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
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  ...theme.scrollBar
}));
