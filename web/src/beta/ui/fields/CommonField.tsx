import { FC, ReactNode } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export interface CommonFieldProps {
  title?: string;
  description?: string;
}

const CommonField: FC<CommonFieldProps & { children?: ReactNode }> = ({
  title,
  description,
  children,
}) => {
  return (
    <Wrapper>
      {title && <Typography size="body">{title}</Typography>}
      {children}
      {description && <Description size="footnote">{description}</Description>}
    </Wrapper>
  );
};

export default CommonField;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const Description = styled(Typography)`
  color: ${({ theme }) => theme.content.weak};
`;
