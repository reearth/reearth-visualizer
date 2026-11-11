import type { Reearth } from "@reearth/visualizer-plugin-api";

export type GlobalThis = {
  reearth: Reearth;
  console: {
    readonly log: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
  };
};
