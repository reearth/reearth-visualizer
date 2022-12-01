import React, { useCallback, useRef } from "react";

import Dropdown, { Ref as DropDownRef } from "@reearth/components/atoms/Dropdown";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { Workspace } from "@reearth/components/molecules/Common/Header";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/components/molecules/Common/MenuList";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

const WorkspaceMenu: React.FC<Props> = ({
  currentWorkspace,
  workspaces,
  onWorkspaceChange,
  openModal,
}) => {
  const t = useT();
  const dropDownRef = useRef<DropDownRef>(null);

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      dropDownRef.current?.close();
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange],
  );

  const label = <MenuListItemLabel text={t("Workspaces")} />;
  const theme = useTheme();

  return (
    <Dropdown label={label} direction="right" hasIcon>
      <DropdownInner>
        <MenuList>
          {workspaces.map(workspace => (
            <MenuListItem
              key={workspace.id}
              onClick={() => workspace.id && handleWorkspaceChange(workspace.id)}>
              <TeamStatus align="center" justify="space-between">
                <Text
                  size="m"
                  color={theme.main.text}
                  otherProperties={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                    flex: 1,
                  }}>
                  {workspace.name}
                </Text>
                {workspace.id === currentWorkspace.id && <TeamStatusIcon isActive />}
              </TeamStatus>
            </MenuListItem>
          ))}
          <MenuListItem>
            <MenuListItemLabel
              icon="workspaces"
              linkTo={`/settings/workspaces`}
              text={t("Manage Workspaces")}
            />
          </MenuListItem>
          <MenuListItem>
            <MenuListItemLabel icon="workspaceAdd" onClick={openModal} text={t("New Workspace")} />
          </MenuListItem>
        </MenuList>
      </DropdownInner>
    </Dropdown>
  );
};

const DropdownInner = styled.div`
  padding: 0;
  max-width: 230px;
`;

const TeamStatus = styled(Flex)`
  width: calc(100% - 32px);
  height: 52px;
  padding: 0 16px;
`;

const TeamStatusIcon = styled.div<{ isActive: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 4px;
  order: 2;
  background-color: ${({ theme }) => theme.main.highlighted};
`;

export default WorkspaceMenu;
