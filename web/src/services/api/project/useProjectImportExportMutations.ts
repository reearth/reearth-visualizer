import { useMutation } from "@apollo/client";
import { EXPORT_PROJECT } from "@reearth/services/gql/queries/project";
import { useT } from "@reearth/services/i18n";
import { useRestful } from "@reearth/services/restful";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { ImportProjectResponse } from "./types";

const CHUNK_SIZE = 16 * 1024 * 1024;

type SignedUploadURLResponse = {
  target_workspace: string;
  temporary_project: string;
  upload_url: string;
  expires_at: string;
  content_type: string;
};

type LastResponse = {
  status: "error" | "uploaded" | "uploading";
  project_id: string | undefined;
};

export const useProjectImportExportMutations = () => {
  const { axios } = useRestful();
  const [, setNotification] = useNotification();
  const t = useT();

  const [exportProjectMutation] = useMutation(EXPORT_PROJECT);

  const getBackendUrl = useCallback(() => {
    const apiUrl = window.REEARTH_CONFIG?.api;
    return apiUrl?.replace(/\/api$/, "");
  }, []);

  const exportProject = useCallback(
    async (projectId: string) => {
      if (!projectId) return { status: "error" };

      try {
        const { data, errors } = await exportProjectMutation({
          variables: { projectId },
          context: {
            fetchOptions: {
              __timeout: 1000 * 60 * 30 // 30 minutes
            }
          }
        });

        if (errors || !data?.exportProject?.projectDataPath) {
          console.log("GraphQL: Failed to export project", errors);
          setNotification({
            type: "error",
            text: t("Failed to export project.")
          });

          return { status: "error" };
        }

        const projectDataPath = data.exportProject.projectDataPath;

        const backendUrl = getBackendUrl();
        const downloadUrl = `${backendUrl}${projectDataPath}`;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${projectId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setNotification({
          type: "success",
          text: t("Successfully exported project!")
        });

        return { status: "success" };
      } catch (error) {
        console.log("GraphQL: Failed to export project", error);
        setNotification({
          type: "error",
          text: t("Failed to export project.")
        });
        return { status: "error" };
      }
    },
    [exportProjectMutation, t, setNotification, getBackendUrl]
  );

  const importProject = useCallback(
    async (file: File, workspaceId: string) => {
      let lastResponse: LastResponse = {
        status: "uploading",
        project_id: undefined
      };

      // --- Step 1: Obtain the signed URL ---
      const form = new FormData();
      form.append("workspace_id", workspaceId);

      let signed: SignedUploadURLResponse;
      try {
        const res = await axios.post<SignedUploadURLResponse>(
          "/signature-url",
          form
        );
        signed = res.data;
      } catch (error) {
        setNotification({
          type: "error",
          text: t("Failed to get a signed upload URL.")
        });
        console.error("signature-url error:", error);
        return { status: "error" };
      }

      const { upload_url, content_type, temporary_project } = signed;

      // --- Step 2: PUT to the signed URL (single upload) ---
      try {
        const ct = content_type || file.type || "application/octet-stream";
        const putRes = await axios.put(upload_url, file, {
          headers: {
            "Content-Type": ct
          },
          onUploadProgress: (e) => {
            if (e.total) {
              console.log(
                "Uploading...",
                Math.round((e.loaded / e.total) * 100) + "%"
              );
            }
          }
        });

        if (putRes.status < 200 || putRes.status >= 300) {
          throw new Error(`Upload failed: ${putRes.status}`);
        }

        lastResponse = {
          status: "uploaded",
          project_id: temporary_project
        };
        setNotification({ type: "success", text: t("Upload completed.") });
      } catch (error) {
        setNotification({
          type: "error",
          text: t("Failed to upload the file.")
        });
        console.error("upload PUT error:", error);
        return { status: "error", project_id: undefined };
      }

      return lastResponse;
    },
    [axios, setNotification, t]
  );

  const importProjectWithSplitImport = useCallback(
    async (file: File, workspaceId: string): Promise<ImportProjectResponse> => {
      const CHUNK_CONCURRENCY = 4;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileId = uuidv4();
      let lastResponse = null;

      const uploadChunk = async (chunkNum: number) => {
        const start = chunkNum * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk, `${file.name}.part${chunkNum}`);
        formData.append("file_id", fileId);
        formData.append("workspace_id", workspaceId);
        formData.append("chunk_num", chunkNum.toString());
        formData.append("total_chunks", totalChunks.toString());

        const response = await axios.post("/split-import", formData);
        return response.data;
      };

      const chunkIndices = Array.from({ length: totalChunks }, (_, i) => i);

      const parallelUpload = async (indices: number[]): Promise<unknown[]> => {
        const results = [];

        // 1. Always upload chunk 0 first
        try {
          const firstChunkResponse = await uploadChunk(0);
          results.push(firstChunkResponse);
        } catch (error) {
          setNotification({
            type: "error",
            text: t("Failed to upload chunk 0.")
          });
          console.error("Failed chunk 0:", error);
          return [{ status: "error" }];
        }

        // 2. Upload remaining chunks in parallel (excluding 0)
        const remaining = indices.slice(1);

        for (let i = 0; i < remaining.length; i += CHUNK_CONCURRENCY) {
          const batch = remaining.slice(i, i + CHUNK_CONCURRENCY);
          try {
            const responses = await Promise.all(batch.map(uploadChunk));
            results.push(...responses);
          } catch (error) {
            setNotification({
              type: "error",
              text: t("Failed to import project.")
            });
            console.error("Failed chunk batch:", error);
            return [{ status: "error" }];
          }
        }

        return results;
      };

      const responses = await parallelUpload(chunkIndices);
      lastResponse = responses.at(-1);

      return (
        (lastResponse as ImportProjectResponse) || { status: "chunk_received" }
      );
    },
    [axios, setNotification, t]
  );

  return {
    exportProject,
    importProject,
    importProjectWithSplitImport
  };
};
