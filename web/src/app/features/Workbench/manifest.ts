import * as yaml from "js-yaml";

import type { PluginExtension, ReearthYML } from "./types";

const isPluginExtension = (value: unknown): value is PluginExtension =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as PluginExtension).id === "string" &&
  typeof (value as PluginExtension).type === "string";

/** Checks the parts of reearth.yml the workbench relies on. */
export const parseManifest = (raw: unknown): ReearthYML | undefined => {
  if (typeof raw !== "object" || raw === null) return;
  const data = raw as Record<string, unknown>;
  if (typeof data.id !== "string") return;
  if (
    data.extensions !== undefined &&
    (!Array.isArray(data.extensions) ||
      !data.extensions.every(isPluginExtension))
  ) {
    return;
  }
  return data as unknown as ReearthYML;
};

export type ManifestResult =
  | { success: true; data: ReearthYML }
  | { success: false; message: string };

/** Parses the text of a reearth.yml, saying what is wrong when it can't. */
export const parseManifestText = (text: string): ManifestResult => {
  let raw: unknown;
  try {
    raw = yaml.load(text);
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err)
    };
  }
  const data = parseManifest(raw);
  return data
    ? { success: true, data }
    : {
        success: false,
        message: "needs an id, and an id and a type for each extension"
      };
};
