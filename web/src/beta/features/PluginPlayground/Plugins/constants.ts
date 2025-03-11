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

export const SHARED_PLUGIN_ID = "e99982f9-143a-44db-9869-b2bd90578190";
