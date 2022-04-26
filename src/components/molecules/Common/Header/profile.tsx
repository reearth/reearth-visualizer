import React, { useRef } from "react";
import { useIntl } from "react-intl";

import Avatar from "@reearth/components/atoms/Avatar";
import Dropdown, { Ref as DropDownRef } from "@reearth/components/atoms/Dropdown";
import Text from "@reearth/components/atoms/Text";
import {
  MenuList,
  MenuListItem,
  MenuListItemLabel,
} from "@reearth/components/molecules/Common/MenuList";
import TeamMenu from "@reearth/components/molecules/Common/TeamMenu";
import { styled, useTheme } from "@reearth/theme";

import { User, Team, Project } from "./types";

export interface LoginProps {
  user: User;
  currentTeam: Team;
  currentProject: Project;
}
export interface Props {
  teams: Team[];
  onSignOut: () => void;
  onChangeTeam?: (teamId: string) => void;
  openModal?: () => void;
}

const Label: React.FC<Pick<LoginProps, "user" | "currentTeam">> = ({ user, currentTeam }) => {
  const theme = useTheme();
  return (
    <LabelWrapper>
      <LabelLeft>
        <Avatar color={theme.main.avatarBg} innerText={user.name} />
      </LabelLeft>
      <LabelRight>
        <LabelUserName size="m" weight="bold" color={theme.main.strongText}>
          {user.name}
        </LabelUserName>
        <LabelTeamName size="xs" color={theme.main.strongText}>
          {currentTeam.name}
        </LabelTeamName>
      </LabelRight>
    </LabelWrapper>
  );
};

const HeaderProfile: React.FC<Props & Partial<LoginProps>> = ({
  user = { name: "" },
  currentTeam = { id: undefined, name: "" },
  teams = [],
  onSignOut,
  onChangeTeam,
  openModal,
}) => {
  const intl = useIntl();

  const dropDownRef = useRef<DropDownRef>(null);

  return (
    <Wrapper>
      <StyledDropdown
        ref={dropDownRef}
        openOnClick
        noHoverStyle
        direction="down"
        hasIcon
        label={<Label user={user} currentTeam={currentTeam} />}>
        <ChildrenWrapper>
          <MenuList>
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/account`}
                text={intl.formatMessage({ defaultMessage: "Account Settings" })}
              />
            </MenuListItem>
            <MenuListItem noHover>
              <TeamMenu
                currentTeam={currentTeam}
                teams={teams}
                onChangeTeam={onChangeTeam}
                openModal={openModal}
              />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemLabel
                icon="logout"
                onClick={onSignOut}
                text={intl.formatMessage({ defaultMessage: "Log out" })}
              />
            </MenuListItem>
          </MenuList>
        </ChildrenWrapper>
      </StyledDropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  cursor: pointer;
  height: 100%;
`;

const StyledDropdown = styled(Dropdown)`
  padding: 0 24px;
`;

const ChildrenWrapper = styled.div`
  width: 230px;
  background-color: ${({ theme }) => theme.header.bg};
  padding: 0;
`;

const LabelWrapper = styled.div`
  display: flex;
  height: 100%;
  padding-left: 10px;
`;

const LabelRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LabelLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 16px;
`;

const LabelTeamName = styled(Text)`
  margin-top: 2px;
`;

const LabelUserName = styled(Text)`
  margin-bottom: 2px;
`;

export default HeaderProfile;
