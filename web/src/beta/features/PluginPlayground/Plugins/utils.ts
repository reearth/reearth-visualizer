import { ALLOWED_FILE_EXTENSIONS } from "./constants";

export const validateFileTitle = (
  fileTitle: string,
  existingFileTitles: string[]
) => {
  if (fileTitle === "") {
    return {
      success: false,
      message: "File name cannot be empty"
    } as const;
  }
  if (existingFileTitles.includes(fileTitle)) {
    return {
      success: false,
      message: "File name already exists"
    } as const;
  }

  const extension = fileTitle.split(".").pop();
  if (
    extension === undefined ||
    !ALLOWED_FILE_EXTENSIONS.includes(
      extension as Readonly<typeof ALLOWED_FILE_EXTENSIONS>[number]
    )
  ) {
    return {
      success: false,
      message: "Invalid file type"
    } as const;
  }

  return {
    success: true
  } as const;
};

export type ValidateFileTitleResult = ReturnType<typeof validateFileTitle>;
