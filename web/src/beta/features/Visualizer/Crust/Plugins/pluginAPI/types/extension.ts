import { WidgetLayout } from "@reearth/beta/features/Visualizer/Crust/Widgets/types";

export declare type Extension = {
  readonly block?: Block;
  readonly widget?: Widget;
  readonly list: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: any) => void;
};

export declare type Block = {
  readonly id: string;
  readonly name?: string | null;
  readonly pluginId: string;
  readonly extensionId: string;
  readonly propertyId?: string;
  readonly property?: any;
};

export declare type Widget<P = any> = {
  readonly id: string;
  readonly pluginId?: string;
  readonly extensionId?: string;
  readonly property?: P;
  readonly propertyId?: string;
  readonly extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  readonly layout?: WidgetLayout;
};

export declare type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block" | "infoboxBlock" | "storyBlock";
  readonly runTimes: number | undefined; // Count number of plugin is run
};
