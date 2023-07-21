import { useCallback } from "react";

// import Avatar from "@reearth/beta/components/Avatar";
import Dropdown, { MenuItem } from "@reearth/beta/components/Dropdown";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../types";

export type LoginProps = {
  username: string;
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

const Label: React.FC<LoginProps> = ({ currentWorkspace }) => (
  <LabelWrapper>
    <Text size="body" weight="bold" customColor>
      {currentWorkspace.name}
    </Text>
  </LabelWrapper>
);

const HeaderProfile: React.FC<Props & Partial<LoginProps>> = ({
  username = "",
  currentWorkspace = { id: undefined, name: "" },
  personalWorkspace,
  workspaces = [],
  onSignOut,
  onWorkspaceChange,
  openModal,
}) => {
  const t = useT();

  const menuItems: MenuItem[] = [
    { text: t("Account Settings"), linkTo: "/settings/account" },
    {
      text: t("Workspaces"),
      items: [
        ...workspaces.map(w => {
          return {
            text: w.name ?? t("Unknown"),
            selected: currentWorkspace.id === w.id,
            onClick: () => w.id && handleWorkspaceChange(w.id),
          };
        }),
        { text: t("Manage Workspaces"), icon: "workspaces", linkTo: "/settings/workspaces" },
        { text: t("New Workspace"), icon: "workspaceAdd", onClick: openModal },
      ],
    },
    { text: t("Log out"), onClick: onSignOut, breakpoint: true },
    { breakpoint: true },
    { text: `v${__APP_VERSION__}` },
  ];

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange],
  );

  return (
    <StyledDropdown
      openOnClick
      direction="down"
      gap="lg"
      hasIcon
      label={
        <Label
          username={username}
          personalWorkspace={personalWorkspace}
          currentWorkspace={currentWorkspace}
        />
      }
      menu={{
        width: 240,
        items: menuItems,
      }}
    />
  );
};

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  margin-left: -8px;
  margin-right: -8px;
  color: ${({ theme }) => theme.general.content.weak};
`;

const LabelWrapper = styled.div`
  display: flex;
  height: 100%;
`;

export default HeaderProfile;
