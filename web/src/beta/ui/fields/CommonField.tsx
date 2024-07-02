import { FC, ReactNode } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export interface CommonFieldProps {
  commonTitle?: string;
  description?: string;
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  commonTitle,
  description,
  children,
}) => {
  return (
    <Wrapper>
      {commonTitle && <Typography size="body">{commonTitle}</Typography>}
      {children}
      {description && <Description size="footnote">{description}</Description>}
    </Wrapper>
  );
};

export default CommonField;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.content.weak,
}));
