import React, { useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import Dropdown, { Ref as DropDownRef } from "@reearth/components/atoms/Dropdown";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { Team } from "@reearth/components/molecules/Common/Header";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/components/molecules/Common/MenuList";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  currentTeam: Team;
  teams: Team[];
  onChangeTeam?: (teamId: string) => void;
  openModal?: () => void;
};

const TeamMenu: React.FC<Props> = ({ currentTeam, teams, onChangeTeam, openModal }) => {
  const intl = useIntl();
  const dropDownRef = useRef<DropDownRef>(null);

  const handleTeamChange = useCallback(
    (t: string) => {
      dropDownRef.current?.close();
      onChangeTeam?.(t);
    },
    [onChangeTeam],
  );

  const label = <MenuListItemLabel text={intl.formatMessage({ defaultMessage: "Workspaces" })} />;
  const theme = useTheme();

  return (
    <Dropdown label={label} direction="right" hasIcon>
      <DropdownInner>
        <MenuList>
          {teams.map(team => (
            <MenuListItem key={team.id} onClick={() => team.id && handleTeamChange(team.id)}>
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
                  {team.name}
                </Text>
                {team.id === currentTeam.id && <TeamStatusIcon isActive />}
              </TeamStatus>
            </MenuListItem>
          ))}
          <MenuListItem>
            <MenuListItemLabel
              icon="workspaces"
              linkTo={`/settings/workspaces`}
              text={intl.formatMessage({ defaultMessage: "Manage Workspaces" })}
            />
          </MenuListItem>
          <MenuListItem>
            <MenuListItemLabel
              icon="workspaceAdd"
              onClick={openModal}
              text={intl.formatMessage({ defaultMessage: "New Workspace" })}
            />
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

export default TeamMenu;
