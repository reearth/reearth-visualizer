import React, { useRef } from "react";

import Avatar from "@reearth/beta/components/Avatar";
import Dropdown, { Ref as DropDownRef } from "@reearth/beta/components/Dropdown";
import Text from "@reearth/beta/components/Text";
import {
  MenuList,
  MenuListItem,
  MenuListItemLabel,
} from "@reearth/beta/features/Navbar/Menus/MenuList";
import WorkspaceMenu from "@reearth/beta/features/Navbar/Menus/WorkspaceMenu";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { User, Workspace } from "../../types";

export type LoginProps = {
  user: User;
  currentWorkspace: Workspace;
  personalWorkspace?: boolean;
};
export type Props = {
  workspaces?: Workspace[];
  personalWorkspace?: boolean;
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

const Label: React.FC<LoginProps> = ({ user, currentWorkspace }) => {
  const theme = useTheme();
  return (
    <LabelWrapper>
      <LabelLeft>
        <Avatar innerText={user.name} borderRadius="4px" />
      </LabelLeft>
      <WorkspaceName size="h5" color={theme.general.content.weak}>
        {currentWorkspace.name}
      </WorkspaceName>
    </LabelWrapper>
  );
};

const HeaderProfile: React.FC<Props & Partial<LoginProps>> = ({
  user = { name: "" },
  currentWorkspace = { id: undefined, name: "" },
  personalWorkspace,
  workspaces = [],
  onSignOut,
  onWorkspaceChange,
  openModal,
}) => {
  const t = useT();

  const dropDownRef = useRef<DropDownRef>(null);

  return (
    <StyledDropdown
      ref={dropDownRef}
      openOnClick
      noHoverStyle
      direction="down"
      hasIcon
      label={
        <Label
          user={user}
          personalWorkspace={personalWorkspace}
          currentWorkspace={currentWorkspace}
        />
      }>
      <ChildrenWrapper>
        <MenuList>
          <MenuListItem>
            <MenuListItemLabel linkTo={`/settings/account`} text={t("Account Settings")} />
          </MenuListItem>
          <MenuListItem>
            <WorkspaceMenu
              currentWorkspace={currentWorkspace}
              workspaces={workspaces}
              onWorkspaceChange={onWorkspaceChange}
              openModal={openModal}
            />
          </MenuListItem>
          <MenuListItem>
            <MenuListItemLabel icon="logout" onClick={onSignOut} text={t("Log out")} />
          </MenuListItem>
        </MenuList>
        <CurrentVersion size="h5">{`v${__APP_VERSION__}`}</CurrentVersion>
      </ChildrenWrapper>
    </StyledDropdown>
  );
};

const StyledDropdown = styled(Dropdown)`
  cursor: pointer;
  height: 100%;
`;

const ChildrenWrapper = styled.div`
  width: 230px;
  background-color: ${({ theme }) => theme.general.bg.strong};
  padding: 0;
`;

const LabelWrapper = styled.div`
  display: flex;
  height: 100%;
  padding-left: 10px;
`;

const WorkspaceName = styled(Text)`
  align-self: center;
`;

const LabelLeft = styled.div`
  margin-right: 16px;
`;

const CurrentVersion = styled(Text)`
  padding: 5px 16px;
  cursor: default;
  border-top: ${({ theme }) => `0.5px solid ${theme.general.border}`};
`;

export default HeaderProfile;
