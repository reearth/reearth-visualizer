import NotFound from "@reearth/app/features/NotFound";
import ProjectSettings, {
  ProjectSettingsTab,
  projectSettingsTabs
} from "@reearth/app/features/ProjectSettings";
import Page from "@reearth/app/pages/Page";
import { FC } from "react";
import { useParams } from "react-router";

function isProjectSettingTab(
  tab: string | undefined
): tab is ProjectSettingsTab {
  return projectSettingsTabs.includes(tab as ProjectSettingsTab) || !tab;
}

const ProjectSettingsPage: FC = () => {
  const { projectId, tab, subId } = useParams<{
    projectId: string;
    tab?: ProjectSettingsTab;
    subId?: string;
  }>();

  return !projectId || !isProjectSettingTab(tab) ? (
    <NotFound />
  ) : (
    <Page
      projectId={projectId}
      renderItem={(props) => (
        <ProjectSettings
          projectId={projectId}
          tab={tab || "general"}
          subId={subId}
          {...props}
        />
      )}
    />
  );
};

export default ProjectSettingsPage;
