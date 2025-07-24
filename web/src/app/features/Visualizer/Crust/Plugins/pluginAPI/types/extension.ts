import { WidgetLayout } from "@reearth/app/features/Visualizer/Crust/Widgets/types";
import { Layer } from "@reearth/core";

import { PluginInfoboxBlock } from "../../../Infobox/types";
import { PluginStoryBlock } from "../../../StoryPanel/types";

export declare type Extension = {
  readonly block?: PluginStoryBlock | (PluginInfoboxBlock & { layer?: Layer });
  readonly widget?: Widget;
  readonly list: PluginExtensionInstance[];
  readonly postMessage?: (id: string, message: unknown) => void;
  readonly on: ExtensionEvents["on"];
  readonly off: ExtensionEvents["off"];
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
    options?: { once?: boolean }
  ) => void;
  readonly off: <T extends keyof ExtensionEventType>(
    type: T,
    callback: (...args: ExtensionEventType[T]) => void
  ) => void;
};

export declare type ExtensionMessage = {
  data: unknown;
  sender: string;
};
