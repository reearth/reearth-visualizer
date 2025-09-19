import {
  useProject,
  useProjectImportExportMutations
} from "@reearth/services/api/project";
import { ProjectImportStatus } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

export default ({
  workspaceId,
  refetchProjectList
}: {
  workspaceId?: string;
  refetchProjectList: () => void;
}) => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [importStatus, setImportStatus] = useState<ProjectImportStatus>(
    ProjectImportStatus.None
  );
  const [importingProjectId, setImportingProjectId] = useState<
    string | undefined
  >(undefined);
  const [importResultLog, setImportResultLog] = useState<string | undefined>(
    undefined
  );

  const { importProject } = useProjectImportExportMutations();

  const handleProjectImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !workspaceId) return;
      setImportStatus(ProjectImportStatus.Uploading);

      const result = await importProject(file, workspaceId);

      if (!result.project_id) {
        // We don't have error log if error happens during upload step
        // Error notification is sent by importProject
        setImportStatus(ProjectImportStatus.None);
        setImportingProjectId(undefined);
        return;
      }

      const projectId = result.project_id;
      setImportStatus(ProjectImportStatus.Processing);
      setImportingProjectId(projectId);
    },
    [workspaceId, importProject]
  );

  const { refetch: refetchProject } = useProject(importingProjectId);

  useEffect(() => {
    if (!importingProjectId) return;

    let retries = 0;
    const MAX_RETRIES = 100;

    const interval = setInterval(() => {
      if (++retries > MAX_RETRIES) {
        clearInterval(interval);
        return;
      }

      refetchProject().then((result) => {
        const status =
          result.data?.node?.__typename === "Project"
            ? result.data.node.metadata?.importStatus
            : undefined;

        switch (status) {
          case ProjectImportStatus.Failed:
            setImportStatus(status);
            setImportResultLog(
              result.data?.node?.__typename === "Project"
                ? result.data.node.metadata?.imporResultLog
                : undefined
            );
            break;
          case ProjectImportStatus.Success:
            setNotification({
              type: "success",
              text: t("Successfully imported project!")
            });
            refetchProjectList();
            setImportStatus(ProjectImportStatus.None);
            clearInterval(interval);
            break;
          case ProjectImportStatus.Processing:
          case ProjectImportStatus.Uploading:
            setImportStatus(status);
            break;
          default:
            setImportStatus(ProjectImportStatus.None);
            break;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [
    importingProjectId,
    refetchProjectList,
    refetchProject,
    setNotification,
    t
  ]);

  const handleProjectImportErrorDownload = useCallback(() => {
    if (!importResultLog) return;

    const element = document.createElement("a");
    const file = new Blob([importResultLog], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "import_error_log.txt";
    document.body.appendChild(element);
    element.click();
  }, [importResultLog]);

  const handleProjectImportErrorClose = useCallback(() => {
    setImportStatus(ProjectImportStatus.None);
    setImportingProjectId(undefined);
    setImportResultLog(undefined);
  }, []);

  return {
    importStatus,
    handleProjectImport,
    handleProjectImportErrorDownload,
    handleProjectImportErrorClose
  };
};
