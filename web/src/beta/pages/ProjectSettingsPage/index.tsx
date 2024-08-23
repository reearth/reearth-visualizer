import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import ProjectSettings, {
  isProjectSettingTab,
} from "@reearth/beta/features/ProjectSettings";
import Page from "@reearth/beta/pages/Page";

const ProjectSettingsPage: FC = () => {
  const { projectId, tab, subId } = useParams<{
    projectId: string;
    tab?: string;
    subId?: string;
  }>();

  const namedTab = useMemo(() => tab ?? "general", [tab]);

  return !projectId || !isProjectSettingTab(namedTab) ? (
    <NotFound />
  ) : (
    <Page
      projectId={projectId}
      renderItem={(props) => (
        <ProjectSettings
          projectId={projectId}
          tab={namedTab}
          subId={subId}
          {...props}
        />
      )}
    />
  );
};

export default ProjectSettingsPage;
