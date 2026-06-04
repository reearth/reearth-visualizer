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

export const SHARED_PLUGIN_ID = "shared-plugin-id";

// Common server and proxy URI length limits range between 2,000 and 16,000 characters, 5000 chars stays within range.
// Plugins exceeding this are too large to share via URL and must be exported as a file instead.
export const MAX_SHARE_URL_LENGTH = 5000;
