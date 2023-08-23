import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import Navbar from "@reearth/beta/features/Navbar";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";
import GeneralSettings from "./innerPages/GeneralSettings";
import PublicSettings from "./innerPages/PublicSettings";
import StorySettings from "./innerPages/StorySettings";
import { MenuList, MenuListItemLabel } from "./MenuList";

export const projectSettingFields = [
  { id: "general", text: "General" },
  { id: "story", text: "Story" },
  { id: "public", text: "Public" },
  { id: "assets", text: "Assets" },
  { id: "plugin", text: "Plugin" },
];

export function isProjectSettingField(settingField: string): boolean {
  return projectSettingFields.map(f => f.id).includes(settingField);
}

type Props = {
  projectId: string;
  sceneId?: string;
  workspaceId?: string;
  fieldId?: (typeof projectSettingFields)[number]["id"];
  fieldParam?: string;
};

const ProjectSettings: React.FC<Props> = ({
  projectId,
  sceneId,
  workspaceId,
  fieldId,
  fieldParam,
}) => {
  const t = useT();
  const {
    project,
    stories,
    currentStory,
    handleUpdateProject,
    handleArchiveProject,
    handleDeleteProject,
    handleUpdateStory,
  } = useHooks({
    projectId,
    sceneId,
    workspaceId,
    fieldId,
    fieldParam,
  });

  const fields = useMemo(
    () =>
      projectSettingFields.map(f => ({
        id: f.id,
        text: t(f.text),
        linkTo: `/settings/beta/projects/${projectId}/${f.id === "general" ? "" : f.id}`,
      })),
    [projectId, t],
  );

  return (
    <Wrapper>
      <Navbar projectId={projectId} workspaceId={workspaceId} page="settings" />
      <SecondaryNav>
        <Title size="h5">{t("Project Settings")}</Title>
      </SecondaryNav>
      <MainSection>
        <Menu>
          <MenuList>
            {fields.map(field => (
              <MenuListItemLabel
                key={field.id}
                linkTo={field.linkTo}
                text={field.text}
                active={field.id === fieldId}
              />
            ))}
          </MenuList>
        </Menu>
        <Content>
          {fieldId === "general" && project && (
            <GeneralSettings
              project={project}
              onUpdateProject={handleUpdateProject}
              onArchiveProject={handleArchiveProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
          {fieldId === "story" && (
            <StorySettings
              projectId={projectId}
              stories={stories}
              currentStory={currentStory}
              isArchived={project?.isArchived}
              onUpdateStory={handleUpdateStory}
            />
          )}
          {fieldId === "public" && project && (
            <PublicSettings
              project={project}
              stories={stories}
              currentStory={currentStory}
              onUpdateStory={handleUpdateStory}
              onUpdateProject={handleUpdateProject}
            />
          )}
        </Content>
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.content.main};
`;

const SecondaryNav = styled.div`
  color: ${({ theme }) => theme.content.main};
  background-color: ${({ theme }) => theme.bg[1]};
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const Title = styled(Text)`
  padding: 12px;
`;

const MainSection = styled.div`
  flex: 1;
  overflow: auto;
`;

const Menu = styled.div`
  position: fixed;
  height: 100%;
  background-color: ${({ theme }) => theme.bg[1]};
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  margin-left: 200px;
  padding: 20px;
`;

export default ProjectSettings;
