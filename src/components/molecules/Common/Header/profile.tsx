import React, { useRef } from "react";
import { useIntl } from "react-intl";
import Icon from "@reearth/components/atoms/Icon";

import { styled, useTheme } from "@reearth/theme";
import Dropdown, { Ref as DropDownRef } from "@reearth/components/atoms/Dropdown";
import {
  MenuList,
  MenuListItem,
  MenuListItemLabel,
} from "@reearth/components/molecules/Common/MenuList";
import TeamMenu from "@reearth/components/molecules/Common/TeamMenu";
import { User, Team, Project } from "./types";
import Text from "@reearth/components/atoms/Text";

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
        <Avatar>
          <StyledIcon icon="avatar" size={28} />
        </Avatar>
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
        hasIcon
        label={<Label user={user} currentTeam={currentTeam} />}>
        <ChildrenWrapper>
          <Section>
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
                  text={intl.formatMessage({ defaultMessage: "Logout" })}
                />
              </MenuListItem>
            </MenuList>
          </Section>
        </ChildrenWrapper>
      </StyledDropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  cursor: pointer;
`;

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  padding: 0 24px;
`;

const ChildrenWrapper = styled.div`
  width: 230px;
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

const Section = styled.div`
  padding: 0;
`;

// need to setup avatars with users
const Avatar = styled.div<{ avatar?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme, avatar }) => (avatar ? `url(${avatar});` : theme.main.highlighted)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  padding: 0;
`;

export default HeaderProfile;
