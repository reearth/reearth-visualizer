import { IconName } from "@reearth/beta/lib/reearth-ui";

import { GetSceneQuery, PluginExtensionType } from "../../gql";
import { Item, convert } from "../propertyApi/utils";

export const BUTTON_BUILTIN_WIDGET_ID = "reearth/button";
export const NAVIGATOR_BUILTIN_WIDGET_ID = "reearth/navigator";
export const DATA_ATTRIBUTION_WIDGET_ID = "reearth/dataAttribution";
export const GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID = "reearth/googleMapSearch";
// export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";

export const AVAILABLE_WIDGET_IDS = [
  BUTTON_BUILTIN_WIDGET_ID,
  NAVIGATOR_BUILTIN_WIDGET_ID,
  DATA_ATTRIBUTION_WIDGET_ID,
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID
];

export type InstallableWidget = {
  pluginId: string;
  extensionId: string;
  title: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
};

export type InstalledWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  enabled: boolean;
  extended: boolean;
  title: string;
  description: string | undefined;
  icon: string;
  property: {
    id: string;
    items: Item[] | undefined;
  };
};

export const getInstallableWidgets = (rawScene?: GetSceneQuery) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.plugins
    ?.map((p) => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter(
          (e) =>
            e.type === PluginExtensionType.Widget &&
            (AVAILABLE_WIDGET_IDS.includes(`reearth/${e.extensionId}`) ||
              plugin.id !== "reearth")
        )
        .map((e): InstallableWidget => {
          return {
            pluginId: plugin.id,
            extensionId: e.extensionId,
            title: e.translatedName,
            description: e.description,
            icon:
              e.icon ||
              getBuiltinExtensionIcon(plugin.id, e.extensionId) ||
              "plugin",
            disabled:
              (e.singleOnly &&
                !!scene?.widgets?.find(
                  (w) => w.extensionId === e.extensionId
                )) ??
              undefined
          };
        })
        .filter(
          (w): w is InstallableWidget => !!w && !w.title.includes("legacy")
        );
    })
    .reduce<InstallableWidget[]>((a, b) => (b ? [...a, ...b] : a), []);
};

function getBuiltinExtensionIcon(
  pluginId: string,
  extensionId: string
): IconName | undefined {
  switch (`${pluginId}/${extensionId}`) {
    // TODO: get the correct icon from design
    case BUTTON_BUILTIN_WIDGET_ID:
      return "return";
    case NAVIGATOR_BUILTIN_WIDGET_ID:
      return "crosshair";
    case DATA_ATTRIBUTION_WIDGET_ID:
      return "listDashes";
    case GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID:
      return "magnifyingGlass";
    default:
      return undefined;
  }
}

export const getInstalledWidgets = (
  rawScene?: GetSceneQuery
): InstalledWidget[] | undefined => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  return scene?.widgets?.map((w) => {
    const e = getInstallableWidgets(rawScene)?.find(
      (e) => e.extensionId === w.extensionId
    );

    return {
      id: w.id,
      pluginId: w.pluginId,
      extensionId: w.extensionId,
      propertyId: w.property?.id,
      enabled: w.enabled,
      extended: w.extended,
      title: e?.title || "",
      description: e?.description,
      icon: e?.icon || (w.pluginId === "reearth" && w.extensionId) || "plugin",
      property: {
        id: w.property?.id ?? "",
        items: convert(w.property, null)
      }
    };
  });
};
