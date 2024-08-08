import { Link } from "react-router-dom";

import Icon from "@reearth/beta/components/Icon";
import { PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import WorkspaceCreationModal from "../../Modals/WorkspaceCreationModal";
import { Project, Workspace } from "../types";

import Profile from "./Profile";

type Props = {
  currentProject?: Project;
  currentWorkspace?: Workspace;
  username?: string;
  dashboard: boolean;
  personalWorkspace: boolean;
  workspaces?: Workspace[];
  modalShown: boolean;
  sceneId?: string;
  page: "editor" | "settings";
  onSignOut: () => void;
  onWorkspaceCreate?: (data: { name: string }) => Promise<void>;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
  onModalClose?: (r?: boolean) => void;
};

const LeftSection: React.FC<Props> = ({
  dashboard,
  currentProject,
  currentWorkspace,
  personalWorkspace,
  workspaces,
  modalShown,
  sceneId,
  page,
  onSignOut,
  onWorkspaceCreate,
  onWorkspaceChange,
  openModal,
  onModalClose,
}) => {
  const t = useT();
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;

  const menuItems: PopupMenuItem[] = [
    {
      icon: "setting",
      id: "setting",
      title: t("Project settings"),
      path: currentProject?.id ? `/settings/project/${currentProject.id}` : "",
    },
    {
      icon: "plugin",
      id: "plugin",
      title: t("Plugin"),
      path: currentProject?.id ? `/settings/project/${currentProject.id}/plugins` : "",
    },
  ];

  if (documentationUrl) {
    menuItems.push({
      icon: "book",
      id: "documentation",
      title: t("Documentation"),
      onClick: () => window.open(documentationUrl, "_blank", "noopener"),
    } as PopupMenuItem);
  }
  return (
    <Wrapper>
      <StyledLink to={`/dashboard/${currentWorkspace?.id}`}>
        {!dashboard && <StyledIcon icon="dashboard" size={20} />}
      </StyledLink>
      <StyledLink to={`/scene/${sceneId}/map`}>
        {page === "settings" && <StyledIcon icon="scene" size={20} />}
      </StyledLink>
      <Profile
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
      <Separator>/</Separator>
      {currentProject && <PopupMenu label={currentProject.name} menu={menuItems} />}
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
  margin-right: 10px;
  color: ${props => props.theme.content.main};
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  padding: 5px;
  color: ${props => props.theme.content.main};
  &:hover {
    background: ${props => props.theme.bg[3]};
  }
`;

const Separator = styled.div`
  color: ${props => props.theme.content.weak};
  margin: 0px 4px;
  user-select: none;
`;
