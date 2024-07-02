import { FC } from "react";
import { Link } from "react-router-dom";

import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { TabItems } from "../type";

export const Menu: FC<Omit<TabItems, "id">> = ({ icon, text, active, path }) => {
  const theme = useTheme();
  return (
    <StyledLinkButton to={path || ""}>
      <MenuWrapper active={active} path={path}>
        {icon && (
          <Icon
            icon={icon}
            size="normal"
            color={active ? theme.content.main : theme.content.weak}
          />
        )}
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

const MenuWrapper = styled("div")<{ active?: boolean; path?: string }>(
  ({ active, theme, path }) => ({
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    gap: theme.spacing.small,
    background: active ? theme.select.main : "",
    borderRadius: active ? theme.radius.small : "",
    padding: theme.spacing.small,
    cursor: path === " " ? "not-allowed" : "pointer", //Temporaly disable until when the links are added
    ["&:hover"]: {
      background: active ? theme.select.main : theme.bg[2],
      borderRadius: theme.radius.small,
    },
  }),
);
