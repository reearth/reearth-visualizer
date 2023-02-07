import { Brand } from "@reearth/types";

export type DataSource = Brand<string, "DataSource">;

export const parseHost = (source: DataSource): string | undefined => {
  const regexp = /(.*):\/\/([^/]*)/;

  const parsed = source.match(regexp);
  if (!parsed) return undefined;

  return parsed[2];
};

export const getExtname = (url: string | undefined): string | undefined => {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).pathname.split(".")[1];
  } catch {
    return undefined;
  }
};
