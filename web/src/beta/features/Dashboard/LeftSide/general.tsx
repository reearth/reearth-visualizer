import { FC } from "react";
import { Link } from "react-router-dom";

import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { TabMenu } from ".";

export const General: FC<Omit<TabMenu, "id">> = ({ icon, text, active, linkTo }) => {
  const theme = useTheme();
  return (
    <StyledLinkButton to={linkTo || ""}>
      <MenuWrapper active={active}>
        {icon && <Icon icon={icon} size="normal" color={theme.content.main} />}
        <Typography size="body" color={theme.content.main}>
          {text}
        </Typography>
      </MenuWrapper>
    </StyledLinkButton>
  );
};
const StyledLinkButton = styled(Link)(() => ({
  textDecoration: "none",
}));

const MenuWrapper = styled("div")<{ active?: boolean }>(({ active, theme }) => ({
  display: "flex",
  alignItems: "center",
  alignSelf: "stretch",
  gap: theme.spacing.small,
  background: active ? theme.select.main : "",
  borderRadius: active ? theme.radius.small : "",
  padding: theme.spacing.small,
  cursor: "pointer",
  ["&:hover"]: {
    background: active ? theme.select.main : theme.bg[2],
  },
}));