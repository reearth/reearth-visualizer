import Profile from "@reearth/app/features/UserProfile";
import {
  SidebarButtonsWrapper,
  SidebarDivider,
  SidebarFooterSection,
  SidebarMainSection,
  SidebarMenuItem,
  SidebarTopSection,
  SidebarVersion,
  SidebarWrapper
} from "@reearth/app/ui/components/Sidebar";
import { config } from "@reearth/services/config";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import ProductsMenu from "../../ProductsMenu";
import StarredProject from "../ContentsContainer/Projects/StarredProject";
import { TabItems, Workspace } from "../type";

import { AvatarWrapper } from "./Avatar";
import LogoWrapper from "./LogoWrapper";

type Props = {
  workspaces: Workspace[];
  avatarURL?: string;
  tab?: string;
  currentWorkspace?: Workspace;
  userInfo?: {
    name?: string;
    email?: string;
  };
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
  userInfo,
  avatarURL,
  workspaces,
  onSignOut,
  onWorkspaceChange
}) => {
  const isEE = config()?.featureCollection === "ee";

  return (
    <SidebarWrapper data-testid="left-side-panel">
      <SidebarMainSection data-testid="sidebar-main-section">
        <SidebarTopSection data-testid="sidebar-top-section">
          <LogoWrapper data-testid="sidebar-logo" />
          {isEE && <ProductsMenu workspaceId={currentWorkspace?.id} />}
          <AvatarSlot alignRight={!isEE}>
            <AvatarWrapper
              avatarURL={avatarURL}
              userName={userInfo?.name}
              userEmail={userInfo?.email}
              onSignOut={onSignOut}
            />
          </AvatarSlot>
        </SidebarTopSection>
        <SidebarDivider data-testid="sidebar-divider-top" />
        <Profile
          data-testid="sidebar-profile"
          currentUser={currentWorkspace?.name}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
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

const AvatarSlot = styled("div")<{ alignRight: boolean }>(
  ({ alignRight }) => ({
    display: css.display.flex,
    flex: alignRight ? 1 : "0 0 auto",
    alignItems: css.alignItems.center,
    justifyContent: css.justifyContent.flexEnd
  })
);

export default LeftSidePanel;
