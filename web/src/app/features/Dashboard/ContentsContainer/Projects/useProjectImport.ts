import { useProjectImportExportMutations } from "@reearth/services/api/project";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { ProjectImportStatus } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

export default ({
  workspaceId,
  refetchProjectList,
  onImportCompleted
}: {
  workspaceId?: string;
  refetchProjectList: () => void;
  onImportCompleted?: () => void;
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
  const [importErrorLogUrl, setImportErrorLogUrl] = useState<
    string | undefined
  >(undefined);

  const { importProject, importProjectWithSplitImport } =
    useProjectImportExportMutations();

  const handleProjectImport = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !workspaceId) return;
      setImportStatus(ProjectImportStatus.Uploading);

      const { useProjectSplitImport } = appFeature();

      const result = await (useProjectSplitImport
        ? importProjectWithSplitImport(file, workspaceId)
        : importProject(file, workspaceId));

      if (
        result.status === "error" ||
        !("project_id" in result) ||
        !result.project_id
      ) {
        // We don't have error log if error happens during upload step
        // Error notification is handled by the import mutation
        setImportStatus(ProjectImportStatus.None);
        setImportingProjectId(undefined);
        return;
      }

      const projectId = result.project_id;
      setImportStatus(ProjectImportStatus.Processing);
      setImportingProjectId(projectId);
    },
    [workspaceId, importProject, importProjectWithSplitImport]
  );

  useEffect(() => {
    if (!importingProjectId) return;

    let retries = 0;
    let consecutiveErrors = 0;
    const MAX_RETRIES = 20;
    const MAX_CONSECUTIVE_ERRORS = 3;

    const interval = setInterval(async () => {
      if (++retries > MAX_RETRIES) {
        clearInterval(interval);
        setImportStatus(ProjectImportStatus.Failed);
        setImportingProjectId(undefined);
        setNotification({
          type: "error",
          text: t("Import timed out. Please check your project and try again.")
        });
        return;
      }

      try {
        const backendUrl =
          window.REEARTH_CONFIG?.api?.replace(/\/api$/, "") ?? "";
        const res = await fetch(
          `${backendUrl}/api/import-status/${importingProjectId}`
        );
        if (!res.ok) return;

        consecutiveErrors = 0;
        const data = await res.json();
        const status = data?.status as string | undefined;

        switch (status) {
          case ProjectImportStatus.Failed:
            setImportStatus(ProjectImportStatus.Failed);
            setImportErrorLogUrl(data?.errorLogUrl ?? undefined);
            setImportResultLog(JSON.stringify(data));
            setImportingProjectId(undefined);
            clearInterval(interval);
            onImportCompleted?.();
            break;
          case ProjectImportStatus.Success:
            setNotification({
              type: "success",
              text: t("Successfully imported project!")
            });
            refetchProjectList();
            setImportStatus(ProjectImportStatus.None);
            setImportingProjectId(undefined);
            clearInterval(interval);
            onImportCompleted?.();
            break;
          case ProjectImportStatus.Processing:
            setImportStatus(ProjectImportStatus.Processing);
            break;
          default:
            break;
        }
      } catch {
        if (++consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          setNotification({
            type: "error",
            text: t("Failed to check import status")
          });
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [
    importingProjectId,
    refetchProjectList,
    setNotification,
    onImportCompleted,
    t
  ]);

  const handleProjectImportErrorDownload = useCallback(() => {
    const element = document.createElement("a");
    if (importErrorLogUrl) {
      element.href = importErrorLogUrl;
      element.download = "import_error_log.json";
    } else if (importResultLog) {
      const file = new Blob([importResultLog], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "import_error_log.txt";
    } else {
      return;
    }
    document.body.appendChild(element);
    element.click();
  }, [importErrorLogUrl, importResultLog]);

  const handleProjectImportErrorClose = useCallback(() => {
    setImportStatus(ProjectImportStatus.None);
    setImportingProjectId(undefined);
    setImportResultLog(undefined);
    setImportErrorLogUrl(undefined);
  }, []);

  return {
    importStatus,
    handleProjectImport,
    handleProjectImportErrorDownload,
    handleProjectImportErrorClose
  };
};
