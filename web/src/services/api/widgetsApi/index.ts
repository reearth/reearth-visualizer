import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import {
  type WidgetZone,
  type WidgetSection,
  type WidgetArea,
  type Alignment,
  BuiltinWidgets,
  isBuiltinWidget,
} from "@reearth/beta/lib/core/Crust";
import { type WidgetAreaPadding } from "@reearth/beta/lib/core/Crust/Widgets/WidgetAlignSystem/types";
import {
  type Maybe,
  type WidgetZone as WidgetZoneType,
  type WidgetSection as WidgetSectionType,
  type WidgetArea as WidgetAreaType,
} from "@reearth/services/gql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { ADD_WIDGET } from "@reearth/services/gql/queries/widget";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { processProperty } from "../propertyApi/utils";
import { MutationReturn } from "../types";

import { getInstallableWidgets } from "./utils";

export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type Widget<P = any> = {
  id: string;
  pluginId: string;
  extensionId: string;
  property?: P;
  propertyId?: string;
  title?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  extended?: boolean;
  layout?: WidgetLayout;
};

export type WidgetLayoutConstraint = {
  extendable?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
};

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useInstallableWidgetsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const installableWidgets = useMemo(() => getInstallableWidgets(data), [data]);

    return { installableWidgets, ...rest };
  }, []);

  const useInstalledWidgetsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const scene = data?.node?.__typename === "Scene" ? data.node : undefined;

    const installedWidgets = useMemo(() => {
      return scene?.widgets?.map(w => {
        const e = getInstallableWidgets(data)?.find(e => e.extensionId === w.extensionId);

        return {
          id: w.id,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          enabled: w.enabled,
          extended: w.extended,
          title: e?.title || "",
          description: e?.description,
          icon: e?.icon || (w.pluginId === "reearth" && w.extensionId) || "plugin",
        };
      });
    }, [data, scene?.widgets]);

    return { installedWidgets, ...rest };
  }, []);

  const [addWidgetMutation] = useMutation(ADD_WIDGET, { refetchQueries: ["GetScene"] });

  const useAddWidget = useCallback(
    async (sceneId?: string, id?: string): Promise<MutationReturn<Partial<Widget>>> => {
      if (!sceneId || !id)
        return {
          status: "error",
        };

      const [pluginId, extensionId] = id.split("/");
      const { data, errors } = await addWidgetMutation({
        variables: { sceneId: sceneId ?? "", pluginId, extensionId },
      });

      if (errors || !data?.addWidget) {
        console.log("GraphQL: Failed to add widget", errors);
        setNotification({ type: "error", text: t("Failed to add widget.") });

        return { status: "error" };
      }

      return {
        data: data.addWidget.sceneWidget,
        status: "success",
      };
    },
    [addWidgetMutation, setNotification, t],
  );

  const useWidgetsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const scene = data?.node?.__typename === "Scene" ? data.node : undefined;

    const layoutConstraint = scene?.plugins
      .map(p =>
        p.plugin?.extensions.reduce<{
          [w in string]: WidgetLayoutConstraint & { floating: boolean };
        }>(
          (b, e) =>
            e?.widgetLayout?.extendable
              ? {
                  ...b,
                  [`${p.plugin?.id}/${e.extensionId}`]: {
                    extendable: {
                      horizontally: e?.widgetLayout?.extendable.horizontally,
                      vertically: e?.widgetLayout?.extendable.vertically,
                    },
                    floating: !!e?.widgetLayout?.floating,
                  },
                }
              : b,
          {},
        ),
      )
      .reduce((a, b) => ({ ...a, ...b }), {});

    const floating = scene?.widgets
      .filter(w => w.enabled && layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
      .map(
        (w): Widget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property, undefined, undefined, undefined),
        }),
      );

    const widgets = scene?.widgets
      .filter(w => w.enabled && !layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
      .map(
        (w): Widget => ({
          id: w.id,
          extended: !!w.extended,
          pluginId: w.pluginId,
          extensionId: w.extensionId,
          property: processProperty(w.property, undefined, undefined, undefined),
        }),
      );

    const widgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone | undefined => {
      const left = widgetSection(zone?.left);
      const center = widgetSection(zone?.center);
      const right = widgetSection(zone?.right);
      if (!left && !center && !right) return;
      return {
        left,
        center,
        right,
      };
    };

    const widgetSection = (section?: Maybe<WidgetSectionType>): WidgetSection | undefined => {
      const top = widgetArea(section?.top);
      const middle = widgetArea(section?.middle);
      const bottom = widgetArea(section?.bottom);
      if (!top && !middle && !bottom) return;
      return {
        top,
        middle,
        bottom,
      };
    };

    const widgetArea = (area?: Maybe<WidgetAreaType>): WidgetArea | undefined => {
      const align = area?.align.toLowerCase() as Alignment | undefined;
      const padding = area?.padding as WidgetAreaPadding | undefined;
      const areaWidgets: Widget[] | undefined = area?.widgetIds
        .map<Widget | undefined>(w => widgets?.find(w2 => w === w2.id))
        .filter((w): w is Widget => !!w);
      if (!areaWidgets || (areaWidgets && areaWidgets.length < 1)) return;
      return {
        align: align ?? "start",
        padding: {
          top: padding?.top ?? 6,
          bottom: padding?.bottom ?? 6,
          left: padding?.left ?? 6,
          right: padding?.right ?? 6,
        },
        widgets: areaWidgets,
        background: area?.background as string | undefined,
        centered: area?.centered,
        gap: area?.gap ?? undefined,
      };
    };

    const ownBuiltinWidgets = scene?.widgets
      .filter(w => w.enabled)
      .map(w => {
        return `${w.pluginId}/${w.extensionId}` as keyof BuiltinWidgets;
      })
      .filter(isBuiltinWidget);

    return {
      widgets: {
        floating,
        alignSystem: {
          outer: widgetZone(scene?.widgetAlignSystem?.outer),
          inner: widgetZone(scene?.widgetAlignSystem?.inner),
        },
        layoutConstraint,
        ownBuiltinWidgets,
      },
      ...rest,
    };
  }, []);

  return {
    useWidgetsQuery,
    useInstallableWidgetsQuery,
    useInstalledWidgetsQuery,
    useAddWidget,
  };
};
