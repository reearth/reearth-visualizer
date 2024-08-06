import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Text from "@reearth/beta/components/Text";
import { PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { Workspace } from "../../types";

export type Props = {
  workspaces?: Workspace[];
  personalWorkspace?: boolean;
  currentWorkspace?: Workspace;
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

const HeaderProfile: React.FC<Props> = ({
  currentWorkspace = { id: undefined, name: "" },
  workspaces = [],
  onSignOut,
  onWorkspaceChange,
}) => {
  const t = useT();

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange],
  );

  const navigate = useNavigate();
  const handleAssetManager = useCallback(() => {
    if (currentWorkspace?.id) {
      navigate(`/dashboard/${currentWorkspace.id}/asset`);
    }
  }, [currentWorkspace.id, navigate]);

  const popupMenu: PopupMenuItem[] = [
    {
      icon: "switch",
      id: "switchWorkspace",
      subItem: workspaces.map(w => {
        return {
          id: w.id as string,
          title: w.name ?? t("Unknown"),
          hasCustomSubMenu: true,
          personal: w.personal,
          selected: currentWorkspace.id === w.id,
          onClick: () => w.id && handleWorkspaceChange(w.id),
        };
      }),
      title: t("Switch workspace"),
    },
    {
      icon: "exit",
      id: "logOut",
      onClick: onSignOut,
      title: t("Log out"),
    },
    {
      icon: "file",
      id: "assetManagement",
      onClick: handleAssetManager,
      title: t("Asset management"),
    },
  ];

  return (
    <Option size="body">
      <PopupMenu label={currentWorkspace.name} menu={popupMenu} />
    </Option>
  );
};

const Option = styled(Text)`
  padding: 7px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

export default HeaderProfile;
