import {
  SidebarButtonsWrapper,
  SidebarDivider,
  SidebarFooterSection,
  SidebarMainSection,
  SidebarMenuItem,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/app/ui/components/Sidebar";
import { FC } from "react";

import StarredProject from "../ContentsContainer/Projects/StarredProject";
import { TabItems, Workspace } from "../type";

import CurrentWorkspace from "./CurrentWorkspace";
import LogoWrapper from "./LogoWrapper";

type Props = {
  workspaces: Workspace[];
  avatarURL?: string;
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
  avatarURL,
  workspaces,
  onSignOut,
  onWorkspaceChange
}) => {
  return (
    <SidebarWrapper data-testid="left-side-panel">
      <SidebarMainSection data-testid="sidebar-main-section">
        <LogoWrapper data-testid="sidebar-logo" />
        <SidebarDivider data-testid="sidebar-divider-top" />
        <CurrentWorkspace
          data-testid="sidebar-profile"
          currentUser={currentWorkspace?.name}
          avatarURL={avatarURL}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onSignOut={onSignOut}
          onWorkspaceChange={onWorkspaceChange}
        />
        <SidebarButtonsWrapper data-testid="sidebar-top-tabs">
          {topTabs?.map((tab) => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={tab.text}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
              data-testid={`sidebar-tab-${tab.id}`}
              tileComponent={tab.tileComponent}
            />
          ))}
        </SidebarButtonsWrapper>
        <SidebarDivider data-testid="sidebar-divider-middle" />
        <StarredProject
          data-testid="sidebar-starred-project"
          workspaceId={currentWorkspace?.id}
        />
      </SidebarMainSection>

      <SidebarFooterSection data-testid="sidebar-footer-section">
        <SidebarDivider data-testid="sidebar-divider-bottom" />
        <SidebarButtonsWrapper data-testid="sidebar-bottom-tabs">
          {bottomTabs?.map((tab) => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={tab.text}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
              data-testid={`sidebar-tab-${tab.id}`}
              tileComponent={tab.tileComponent}
            />
          ))}
        </SidebarButtonsWrapper>
        <SidebarDivider data-testid="sidebar-divider-footer" />
        <SidebarVersion data-testid="sidebar-version" />
      </SidebarFooterSection>
    </SidebarWrapper>
  );
};

export default LeftSidePanel;
