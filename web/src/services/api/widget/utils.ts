import { IconName } from "@reearth/app/lib/reearth-ui";
import { DeviceType } from "@reearth/app/utils/device";
import { appFeature } from "@reearth/services/config/appFeatureConfig";

import {
  GetSceneQuery,
  PluginExtensionType,
  WidgetAlignSystem
} from "../../gql";
import { convert } from "../property/utils";

import { InstallableWidget, InstalledWidget } from "./types";

export const BUTTON_BUILTIN_WIDGET_ID = "reearth/button";
export const NAVIGATOR_BUILTIN_WIDGET_ID = "reearth/navigator";
export const DATA_ATTRIBUTION_WIDGET_ID = "reearth/dataAttribution";
export const GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID = "reearth/googleMapSearch";
export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";

export const AVAILABLE_WIDGET_IDS = [
  BUTTON_BUILTIN_WIDGET_ID,
  NAVIGATOR_BUILTIN_WIDGET_ID,
  DATA_ATTRIBUTION_WIDGET_ID,
  GOOGLE_MAP_SEARCH_BUILTIN_WIDGET_ID,
  TIMELINE_BUILTIN_WIDGET_ID
];

const getWidgetIdsFromWAS = (
  was: WidgetAlignSystem | null | undefined
): string[] => {
  if (!was) return [];

  const widgetIds: string[] = [];

  const zones = [was.outer, was.inner].filter(Boolean);

  zones.forEach((zone) => {
    const sections = [zone?.left, zone?.center, zone?.right].filter(Boolean);

    sections.forEach((section) => {
      const areas = [section?.top, section?.middle, section?.bottom].filter(
        Boolean
      );

      areas.forEach((area) => {
        if (area?.widgetIds) {
          widgetIds.push(...area.widgetIds);
        }
      });
    });
  });

  return widgetIds;
};

export const getInstallableWidgets = (
  rawScene: GetSceneQuery | undefined,
  type: DeviceType
) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  const installedWidgetIds = getWidgetIdsFromWAS(
    scene?.widgetAlignSystem?.[type]
  );

  const installedWidgetExtensionIds = scene?.widgets
    ?.filter((w) => installedWidgetIds.includes(w.id))
    .map((w) => w.extensionId)
    .filter(Boolean);

  const { builtinTimelineWidget } = appFeature();

  const avaliableWidgetIds = builtinTimelineWidget
    ? AVAILABLE_WIDGET_IDS
    : AVAILABLE_WIDGET_IDS.filter((id) => id !== TIMELINE_BUILTIN_WIDGET_ID);

  return scene?.plugins
    ?.map((p) => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter(
          (e) =>
            e.type === PluginExtensionType.Widget &&
            (avaliableWidgetIds.includes(`reearth/${e.extensionId}`) ||
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
                installedWidgetExtensionIds?.includes(e.extensionId)) ??
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
    case TIMELINE_BUILTIN_WIDGET_ID:
      return "timeline";
    default:
      return undefined;
  }
}

export const getInstalledWidgets = (
  rawScene: GetSceneQuery | undefined,
  type: DeviceType
): InstalledWidget[] | undefined => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;

  const installedWidgetIds = getWidgetIdsFromWAS(
    scene?.widgetAlignSystem?.[type]
  );

  const installableWidgets = getInstallableWidgets(rawScene, type);

  return scene?.widgets
    .filter((w) => installedWidgetIds.includes(w.id))
    .map((w) => {
      const e = installableWidgets?.find(
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
        icon:
          e?.icon || (w.pluginId === "reearth" && w.extensionId) || "plugin",
        property: {
          id: w.property?.id ?? "",
          items: convert(w.property, null)
        }
      };
    });
};
