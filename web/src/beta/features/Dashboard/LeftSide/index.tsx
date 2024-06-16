import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import { IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { General } from "./general";

export type Props = {
  currentUser?: string;
  workspaceId?: string;
};

export type TabMenu = {
  id: string;
  text?: string;
  icon?: IconName;
  linkTo?: string;
  active?: boolean;
};

const tabsMenu: Omit<TabMenu[], "linkTo" | "active"> = [
  { id: "project", text: "Project", icon: "grid" },
  { id: "asset", text: "Assets", icon: "file" },
  { id: "members", text: "Members", icon: "appearance" },
  { id: "bin", text: "Recycle bin", icon: "trash" },
];

const LeftSidePanel: FC<Props> = ({ currentUser, workspaceId }) => {
  const t = useT();
  const { tab } = useParams<{
    tab?: string;
  }>();
  const currentTab = useMemo(() => tab ?? "project", [tab]);

  const tabs = useMemo(
    () =>
      tabsMenu.map(tab => ({
        ...tab,
        linkTo: `/dashboard/${workspaceId}/${tab.id === "project" ? "" : tab.id}`,
      })),
    [workspaceId],
  );

  return (
    <Wrapper>
      <Profile>
        <Avatar>
          <Typography size="body">{currentUser?.charAt(0).toUpperCase()}</Typography>
        </Avatar>
        <Typography size="body" weight="bold">
          {currentUser}
        </Typography>
      </Profile>
      {tabs.map(tab => (
        <General
          key={tab.id}
          linkTo={tab.linkTo}
          text={t(tab.text || "")}
          icon={tab.icon}
          active={tab.id === currentTab}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `0 ${theme.spacing.smallest}px`,
}));

const Profile = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.small}px`,
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export default LeftSidePanel;
