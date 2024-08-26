import { Reearth } from "./reearth";

export type GlobalThis = {
  reearth: Reearth;
  console: {
    readonly log: (...args: unknown[]) => void;
    readonly error: (...args: unknown[]) => void;
  };
};
