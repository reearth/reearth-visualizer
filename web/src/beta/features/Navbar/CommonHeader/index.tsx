import { Link } from "react-router-dom";

import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import WorkspaceCreationModal from "../../Modals/WorkspaceCreationModal";
import ProjectMenu from "../Menus/ProjectMenu";
import { Project, User, Workspace } from "../types";

import Profile from "./Profile";

type Props = {
  currentProject?: Project;
  currentWorkspace?: Workspace;
  user: User;
  dashboard: boolean;
  personalWorkspace: boolean;
  workspaces?: Workspace[];
  modalShown: boolean;
  onSignOut: () => void;
  onWorkspaceCreate?: (data: { name: string }) => Promise<void>;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
  onModalClose?: (r?: boolean) => void;
};
const CommonHeader: React.FC<Props> = ({
  user,
  dashboard,
  currentProject,
  currentWorkspace,
  personalWorkspace,
  workspaces,
  modalShown,
  onSignOut,
  onWorkspaceCreate,
  onWorkspaceChange,
  openModal,
  onModalClose,
}) => {
  return (
    <Wrapper>
      <StyledLink to={`/dashboard/${currentWorkspace?.id}`}>
        {!dashboard && <StyledIcon icon="dashboard" size={24} />}
      </StyledLink>
      <NavMenusWrapper>
        <Profile
          onSignOut={onSignOut}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={onWorkspaceChange}
          openModal={openModal}
          personalWorkspace={personalWorkspace}
          workspaces={workspaces}
          user={user}
        />
        <WorkspaceCreationModal
          open={modalShown}
          onClose={onModalClose}
          onSubmit={onWorkspaceCreate}
        />
        <Separator>/</Separator>
        {currentProject && (
          <ProjectMenu currentProject={currentProject} workspaceId={currentWorkspace?.id} />
        )}
      </NavMenusWrapper>
    </Wrapper>
  );
};
export default CommonHeader;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 368px;
  height: 32px;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.main.text};
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  margin-right: 4px;
  border-radius: 5px;
  padding: 5px;
  color: ${props => props.theme.main.text};
  &:hover {
    background: ${props => props.theme.main.bg};
  }
`;

const NavMenusWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 320px;
  height: 32px;
`;

const Separator = styled.div`
  color: ${props => props.theme.main.weak};
`;
