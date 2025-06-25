import { ALLOWED_FILE_EXTENSIONS } from "./constants";

export const validateFileTitle = (
  fileTitle: string,
  existingFileTitles: string[]
) => {
  const notifyError = (message: string) =>
    ({ success: false, message }) as const;

  if (fileTitle === "") {
    return notifyError("File name cannot be empty");
  }
  if (existingFileTitles.includes(fileTitle)) {
    return notifyError("File name already exists");
  }

  const extension = fileTitle.split(".").pop();
  if (
    extension === undefined ||
    !ALLOWED_FILE_EXTENSIONS.includes(
      extension as Readonly<typeof ALLOWED_FILE_EXTENSIONS>[number]
    )
  ) {
    return notifyError("Invalid file type");
  }

  return {
    success: true
  } as const;
};

export type ValidateFileTitleResult = ReturnType<typeof validateFileTitle>;
