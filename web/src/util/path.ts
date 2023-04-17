import { Brand } from "@reearth/types";

export type DataSource = Brand<string, "DataSource">;

export const parseHost = (source: DataSource): string | undefined => {
  const regexp = /(.*):\/\/([^/]*)/;

  const parsed = source.match(regexp);
  if (!parsed) return undefined;

  return parsed[2];
};
