import {
  SidebarButtonsWrapper,
  SidebarDivider,
  SidebarFooterSection,
  SidebarMainSection,
  SidebarMenuItem,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/beta/ui/components/Sidebar";
import { FC } from "react";

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
  onWorkspaceChange
}) => {
  return (
    <SidebarWrapper>
      <SidebarMainSection>
        <Profile
          currentUser={currentWorkspace?.name}
          isPersonal={isPersonal}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
          onSignOut={onSignOut}
          onWorkspaceChange={onWorkspaceChange}
        />
        <SidebarDivider />
        <SidebarButtonsWrapper>
          {topTabs?.map((tab) => (
            <SidebarMenuItem
              key={tab.id}
              path={tab.path}
              text={tab.text}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
              tileComponent={tab.tileComponent}
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
              text={tab.text}
              icon={tab.icon}
              active={tab.id === currentTab}
              disabled={tab.disabled}
              tileComponent={tab.tileComponent}
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
