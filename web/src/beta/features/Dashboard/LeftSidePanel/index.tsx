import { FC } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { TabItems, Workspace } from "../type";

import { Menu } from "./menuItem";
import { Profile } from "./profile";

type Props = {
  workspaces: Workspace[];
  isPersonal?: boolean;
  tab?: string;
  currentWorkspace?: Workspace;
  topTabs?: TabItems[];
  bottomTabs?: TabItems[];
  onSignOut: () => void;
  onWorkspaceChange: (workspaceId?: string) => void;
};
const LeftSidePanel: FC<Props> = ({
  topTabs,
  bottomTabs,
  tab: currentTab,
  currentWorkspace,
  isPersonal,
  workspaces,
  onSignOut,
  onWorkspaceChange,
}) => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <Section>
        <Profile
          currentUser={currentWorkspace?.name}
          isPersonal={isPersonal}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onSignOut={onSignOut}
          onWorkspaceChange={onWorkspaceChange}
        />
        <>
          {topTabs?.map(tab => (
            <Menu
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
            />
          ))}
        </>
      </Section>
      <Section>
        <>
          {bottomTabs?.map(tab => (
            <Menu
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
            />
          ))}
        </>
        <Version>
          <Typography size="body" color={theme.content.weak}>
            {t("Version 1.0 LTS")}
          </Typography>
        </Version>
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: `0 ${theme.spacing.smallest}px`,
  flex: 1,
  justifyContent: "space-between",
}));

const Section = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
}));

const Version = styled("div")(({ theme }) => ({
  padding: theme.spacing.small,
}));

export default LeftSidePanel;
