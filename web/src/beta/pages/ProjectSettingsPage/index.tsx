import { useParams } from "react-router-dom";

import NotFound from "@reearth/beta/components/NotFound";
import ProjectSettings, { isProjectSettingField } from "@reearth/beta/features/ProjectSettings";
import Page from "@reearth/beta/pages/Page";

type Props = {};

const ProjectSettingsPage: React.FC<Props> = () => {
  const { projectId, fieldId, fieldParam } = useParams<{
    projectId: string;
    fieldId?: string;
    fieldParam?: string;
  }>();
  const settingField = fieldId ?? "general";

  return !projectId || !isProjectSettingField(settingField) ? (
    <NotFound />
  ) : (
    <Page
      projectId={projectId}
      renderItem={props => (
        <ProjectSettings
          projectId={projectId}
          fieldId={settingField}
          fieldParam={fieldParam}
          {...props}
        />
      )}
    />
  );
};

export default ProjectSettingsPage;
