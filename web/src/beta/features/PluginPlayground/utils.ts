import * as yaml from "js-yaml";

import { FileType } from "./Plugins/constants";
import { CustomSchemaField, ReearthYML } from "./types";

export const getLanguageByFileExtension = (fileTitle: string) => {
  const ext = fileTitle.split(".").pop();
  switch (ext) {
    case "js":
      return "javascript";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return "plaintext";
  }
};

export const getYmlJson = (file: FileType) => {
  if (file.sourceCode === "") {
    return { success: false, message: "YAML file is empty" } as const;
  }

  try {
    const data = yaml.load(file.sourceCode) as ReearthYML;
    return { success: true, data } as const;
  } catch (error) {
    const message =
      error instanceof yaml.YAMLException
        ? error.message
        : "Failed to parse YAML";
    return { success: false, message } as const;
  }
};

export const customSchemaFieldsToObject = (array: CustomSchemaField[]) => {
  if (Array.isArray(array)) {
    return array.reduce(
      (acc, item) => {
        const { id, ...rest } = item;
        acc[id as string] = rest;
        return acc;
      },
      {} as Record<string, unknown>
    );
  }
  return {};
};
