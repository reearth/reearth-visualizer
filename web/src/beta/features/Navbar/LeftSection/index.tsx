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
const LeftSection: React.FC<Props> = ({
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
    </Wrapper>
  );
};
export default LeftSection;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 32px;
`;

const StyledLink = styled(Link)`
  display: flex;
  color: ${props => props.theme.general.content.main};
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  padding: 5px;
  color: ${props => props.theme.general.content.main};
  &:hover {
    background: ${props => props.theme.general.bg.weak};
  }
`;

const Separator = styled.div`
  color: ${props => props.theme.general.content.weak};
  margin: 0px 12px;
`;
