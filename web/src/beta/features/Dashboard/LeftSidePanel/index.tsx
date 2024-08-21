import { FC } from "react";

import {
  SidebarMenuItem,
  SidebarSection,
  SidebarVersion,
  SidebarWrapper,
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";

import StarredProject from "../ContentsContainer/Projects/StarredProject";
import { TabItems, Workspace } from "../type";

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

  return (
    <SidebarWrapper>
      <SidebarSection>
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
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
            />
          ))}
        </>
        <StarredProject />
      </SidebarSection>
      <SidebarSection>
        <>
          {bottomTabs?.map(tab => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
            />
          ))}
        </>
        <SidebarVersion />
      </SidebarSection>
    </SidebarWrapper>
  );
};

export default LeftSidePanel;
