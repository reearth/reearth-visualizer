import { Link } from "@reach/router";
import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import NotificationBar, { Type } from "@reearth/components/atoms/NotificationBar";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import { styled, metrics, css } from "@reearth/theme";

import Profile from "./profile";
import { User, Team, Project } from "./types";

export * from "./types";

export type NotificationType = Type;

export interface Props {
  className?: string;
  user?: User;
  currentTeam?: Team;
  currentProject?: Project;
  sceneId?: string;
  teams: Team[];
  icon?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  onForward?: () => void;
  onSignOut?: () => void;
  onCreateTeam?: (data: { name: string }) => Promise<void>;
  onChangeTeam?: (teamId: string) => void;
  modalShown?: boolean;
  openModal?: () => void;
  handleModalClose?: (r?: boolean | undefined) => void;
  notification?: {
    type?: NotificationType;
    text: string;
  };
  onNotificationClose?: () => void;
  dashboard?: boolean;
}

const Header: React.FC<Props> = ({
  className,
  onSignOut,
  user,
  currentTeam,
  currentProject,
  teams,
  center,
  icon,
  right,
  onCreateTeam,
  onChangeTeam,
  modalShown,
  openModal,
  handleModalClose,
  notification,
  onNotificationClose,
  dashboard,
}) => {
  return (
    <>
      <Wrapper className={className}>
        <Content>
          <LeftArea>
            <StyledLink to={`/dashboard/${currentTeam?.id}`}>
              {!dashboard && <StyledIcon icon="dashboard" size={24} />}
            </StyledLink>
            {icon}
            {onSignOut && onChangeTeam && (
              <>
                <Profile
                  user={user}
                  currentTeam={currentTeam}
                  currentProject={currentProject}
                  teams={teams}
                  onSignOut={onSignOut}
                  onChangeTeam={onChangeTeam}
                  openModal={openModal}
                />
                <WorkspaceCreationModal
                  open={modalShown}
                  onClose={handleModalClose}
                  onSubmit={onCreateTeam}
                />
              </>
            )}
          </LeftArea>
          <CenterArea>{center}</CenterArea>
          <RightArea>{right}</RightArea>
        </Content>
      </Wrapper>
      {notification && (
        <NotificationBar
          text={notification.text}
          type={notification.type}
          onClose={onNotificationClose}
        />
      )}
    </>
  );
};

const Wrapper = styled.header`
  width: 100%;
  height: ${metrics.headerHeight}px;
  background: ${props => props.theme.header.bg};
`;

const Content = styled.div`
  display: flex;
  padding: 0 20px;
  width: calc(100% - 40px);
  height: 100%;
  align-items: center;
`;

const itemStyle = css`
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;
`;

const LeftArea = styled.div`
  ${itemStyle}
  justify-content: flex-start;
`;

const CenterArea = styled.div`
  justify-content: center;
  ${itemStyle}
`;

const RightArea = styled.div`
  ${itemStyle}
  justify-content: flex-end;
`;

const StyledIcon = styled(Icon)`
  margin-right: 8px;
  border-radius: 5px;
  padding: 5px;
  color: ${props => props.theme.main.text};
  &:hover {
    background: ${props => props.theme.main.bg};
  }
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.main.text};
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

export default Header;
