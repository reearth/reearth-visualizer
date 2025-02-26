export type PluginType = {
  id: string;
  files: FileType[];
};

export type FileType = {
  id: string;
  title: string;
  sourceCode: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
};

export const ALLOWED_FILE_EXTENSIONS = ["js"] as const;
