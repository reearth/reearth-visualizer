export declare type Plugins = {
  readonly instances: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: any) => void;
};

export declare type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block" | "infoboxBlock" | "storyBlock";
  readonly runTimes: number | undefined; // Count number of plugin is run
};
