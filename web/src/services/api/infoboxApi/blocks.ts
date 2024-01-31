export type InstallableInfoboxBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "InfoboxBlock";
};
