import NotFound from "@reearth/beta/features/NotFound";
import ProjectSettings, {
  ProjectSettingsTab,
  projectSettingsTabs
} from "@reearth/beta/features/ProjectSettings";
import Page from "@reearth/beta/pages/Page";
import { FC } from "react";
import { useParams } from "react-router-dom";

function isProjectSettingTab(
  tab: string | undefined
): tab is ProjectSettingsTab {
  return projectSettingsTabs.includes(tab as ProjectSettingsTab);
}

const ProjectSettingsPage: FC = () => {
  const { projectId, tab, subId } = useParams<{
    projectId: string;
    tab?: ProjectSettingsTab;
    subId?: string;
  }>();

  return !projectId || (tab && !isProjectSettingTab(tab)) ? (
    <NotFound />
  ) : (
    <Page
      projectId={projectId}
      renderItem={(props) => (
        <ProjectSettings
          projectId={projectId}
          tab={tab}
          subId={subId}
          {...props}
        />
      )}
    />
  );
};

export default ProjectSettingsPage;
