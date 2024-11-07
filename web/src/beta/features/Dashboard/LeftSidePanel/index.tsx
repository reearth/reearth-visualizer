import {
  SidebarButtonsWrapper,
  SidebarDivider,
  SidebarFooterSection,
  SidebarMainSection,
  SidebarMenuItem,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { useT } from "@reearth/services/i18n";
import { FC } from "react";

import StarredProject from "../ContentsContainer/Projects/StarredProject";
import { TabItems, Workspace } from "../type";

import LogoWrapper from "./LogoWrapper";
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
  onWorkspaceChange
}) => {
  const t = useT();

  return (
    <SidebarWrapper>
      <SidebarMainSection>
        <LogoWrapper />
        <SidebarDivider />
        <Profile
          currentUser={currentWorkspace?.name}
          isPersonal={isPersonal}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onSignOut={onSignOut}
          onWorkspaceChange={onWorkspaceChange}
        />
        <SidebarButtonsWrapper>
          {topTabs?.map((tab) => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
            />
          ))}
        </SidebarButtonsWrapper>
        <SidebarDivider />
        <StarredProject workspaceId={currentWorkspace?.id} />
      </SidebarMainSection>

      <SidebarFooterSection>
        <SidebarDivider />
        <SidebarButtonsWrapper>
          {bottomTabs?.map((tab) => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={t(tab.text || "")}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
            />
          ))}
        </SidebarButtonsWrapper>
        <SidebarDivider />
        <SidebarVersion />
      </SidebarFooterSection>
    </SidebarWrapper>
  );
};

export default LeftSidePanel;
