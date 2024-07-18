import {
  WidgetLayout,
  WidgetLocationOptions,
} from "@reearth/beta/features/Visualizer/Crust/Widgets/types";
import { Layer } from "@reearth/core";

export declare type Extension = {
  readonly block?: Block;
  readonly widget?: Widget;
  readonly list: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: unknown) => void;
  readonly on: ExtensionEvents["on"];
  readonly off: ExtensionEvents["off"];
};

export declare type Block = {
  readonly id: string;
  readonly name?: string | null;
  readonly pluginId: string;
  readonly extensionId: string;
  readonly propertyId?: string;
  readonly property?: unknown;
  readonly layer?: Layer;
};

export declare type Widget = {
  readonly id: string;
  readonly pluginId?: string;
  readonly extensionId?: string;
  readonly property?: unknown;
  readonly propertyId?: string;
  readonly extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  readonly layout?: WidgetLayout;
  readonly moveTo?: (options: WidgetLocationOptions) => void;
};

export declare type PluginExtensionInstance = {
  readonly id: string;
  readonly pluginId: string;
  readonly name: string;
  readonly extensionId: string;
  readonly extensionType: "widget" | "block" | "infoboxBlock" | "storyBlock";
  readonly runTimes: number | undefined;
};

export declare type ExtensionEventType = {
  message: [message: unknown];
  extensionMessage: [props: ExtensionMessage];
};

export declare type ExtensionEvents = {
  readonly on: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void,
  ) => void;
};

export declare type ExtensionMessage = {
  data: unknown;
  sender: string;
};
