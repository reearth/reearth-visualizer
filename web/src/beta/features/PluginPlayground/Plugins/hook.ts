import { useCallback, useState } from "react";
import useFileInput from "use-file-input";

import { FileType, REEARTH_YML_FILE } from "./constants";
import { validateFileTitle } from "./utils";

export default () => {
  const [files, setFiles] = useState<FileType[]>([REEARTH_YML_FILE]);
  const [selectedFile, setSelectedFile] = useState<FileType>(REEARTH_YML_FILE);

  const selectFile = useCallback((file: FileType) => {
    setSelectedFile(file);
  }, []);

  const addFile = useCallback(
    (title: string) => {
      const result = validateFileTitle(
        title,
        files.map((f) => f.title)
      );
      if (!result.success) {
        return result;
      }
      const newFile = {
        id: generateUniqueId(),
        title,
        sourceCode: ""
      };

      setFiles((files) => [...files, newFile]);
      setSelectedFile(newFile);
      return result;
    },
    [files]
  );

  const updateFileTitle = useCallback(
    (newTitle: string, id: string) => {
      const result = validateFileTitle(
        newTitle,
        files.map((f) => f.title)
      );

      if (!result.success) {
        return result;
      }

      setFiles((files) =>
        files.map((file) =>
          file.id === id ? { ...file, title: newTitle } : file
        )
      );
      return result;
    },
    [files]
  );

  const deleteFile = useCallback((id: string) => {
    setFiles((files) => files.filter((file) => file.id !== id));
  }, []);

  const handleFileUpload = useFileInput((fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const result = validateFileTitle(
      file.name,
      files.map((f) => f.title)
    );
    if (!result.success) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e2) => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      const fileItem = {
        id: generateUniqueId(),
        title: file.name,
        sourceCode: body
      };
      // Note: When a new file is uploaded, select that file
      setSelectedFile(fileItem);
      setFiles((files) => [...files, fileItem]);
    };
    reader.readAsText(file);
  });

  return {
    files,
    selectFile,
    selectedFile,
    addFile,
    updateFileTitle,
    deleteFile,
    handleFileUpload
  };
};

const generateUniqueId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
