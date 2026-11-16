import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useRef, useState } from "react";

import { formatOf } from "./utils";

const MAX_FILE_SIZE_MB = 100;

export type Upload = {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  error?: string;
  assetId?: string;
};

// Queue of files being uploaded (dropped or picked), each with its own status.
export default ({
  uploadFile
}: {
  uploadFile?: (file: File) => Promise<string | undefined>;
}) => {
  const t = useT();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const nextId = useRef(0);

  const update = useCallback((id: string, patch: Partial<Upload>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }, []);

  // Rejects files the layer creator can't use before sending them.
  const validate = useCallback(
    (file: File) => {
      if (!formatOf(file.name))
        return t(
          "This file format is not supported. Please use GeoJSON, CSV, KML or CZML."
        );
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
        return t(
          "The file cannot be greater than {{size}} MB. Please use a smaller file.",
          { size: MAX_FILE_SIZE_MB }
        );
      return undefined;
    },
    [t]
  );

  const enqueue = useCallback(
    (files: File[]) => {
      if (!uploadFile) return;
      const added = files.map((file) => {
        const error = validate(file);
        return {
          id: `upload-${nextId.current++}`,
          file,
          status: error ? "error" : "uploading",
          error
        } as Upload;
      });
      setUploads((prev) => [...prev, ...added]);

      added
        .filter((u) => u.status === "uploading")
        .forEach(async (u) => {
          const assetId = await uploadFile(u.file);
          update(
            u.id,
            assetId
              ? { status: "done", assetId }
              : { status: "error", error: t("Failed to upload the file.") }
          );
        });
    },
    [t, update, uploadFile, validate]
  );

  // The request can't be aborted; removing just drops the row (and ignores
  // its result, since update() no longer finds it).
  const remove = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const clear = useCallback(() => setUploads([]), []);

  return {
    uploads,
    uploading: uploads.some((u) => u.status === "uploading"),
    enqueue,
    remove,
    clear
  };
};
