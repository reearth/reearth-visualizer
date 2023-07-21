import { makeVar } from "@apollo/client";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
};

export const selectedWidgetVar = makeVar<SelectedWidget | undefined>(undefined);

export * from "./jotai";
