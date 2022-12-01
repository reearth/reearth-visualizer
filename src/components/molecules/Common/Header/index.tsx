import { Link } from "react-router-dom";

import Icon from "@reearth/components/atoms/Icon";
import WorkspaceCreationModal from "@reearth/components/molecules/Common/WorkspaceCreationModal";
import { styled, metrics, css } from "@reearth/theme";

import Profile from "./profile";
import type { User, Workspace, Project } from "./types";

export type { User, Workspace, Project } from "./types";

export interface Props {
  className?: string;
  user?: User;
  currentProject?: Project;
  currentWorkspace?: Workspace;
  personalWorkspace?: boolean;
  workspaces?: Workspace[];
  icon?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  modalShown?: boolean;
  dashboard?: boolean;
  onSignOut?: () => void;
  onWorkspaceCreate?: (data: { name: string }) => Promise<void>;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
  onModalClose?: (r?: boolean) => void;
}

const Header: React.FC<Props> = ({
  className,
  user,
  currentWorkspace,
  personalWorkspace,
  workspaces,
  center,
  icon,
  right,
  modalShown,
  dashboard,
  onSignOut,
  onWorkspaceCreate,
  onWorkspaceChange,
  openModal,
  onModalClose,
}) => {
  return (
    <Wrapper className={className}>
      <Content>
        <LeftArea>
          <StyledLink to={`/dashboard/${currentWorkspace?.id}`}>
            {!dashboard && <StyledIcon icon="dashboard" size={24} />}
          </StyledLink>
          {icon}
          {onSignOut && onWorkspaceChange && (
            <>
              <Profile
                user={user}
                currentWorkspace={currentWorkspace}
                personalWorkspace={personalWorkspace}
                workspaces={workspaces}
                onSignOut={onSignOut}
                onWorkspaceChange={onWorkspaceChange}
                openModal={openModal}
              />
              <WorkspaceCreationModal
                open={modalShown}
                onClose={onModalClose}
                onSubmit={onWorkspaceCreate}
              />
            </>
          )}
        </LeftArea>
        <CenterArea>{center}</CenterArea>
        <RightArea>{right}</RightArea>
      </Content>
    </Wrapper>
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
