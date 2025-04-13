import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

export interface CommonFieldProps {
  title?: string;
  description?: string;
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  title,
  description,
  children
}) => {
  const theme = useTheme();
  return (
    <Wrapper>
      {title && <Typography size="body">{title}</Typography>}
      {children}
      {description && (
        <Typography size="footnote" color={theme.content.weak}>
          {description}
        </Typography>
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
