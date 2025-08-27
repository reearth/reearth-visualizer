import { useMutation, useQuery } from "@apollo/client";
import { DeviceType } from "@reearth/app/utils/device";
import {
  SceneWidget,
  WidgetAlignSystemType,
  WidgetAreaAlign,
  WidgetAreaType,
  WidgetSectionType,
  WidgetZoneType
} from "@reearth/services/gql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import {
  ADD_WIDGET,
  REMOVE_WIDGET,
  UPDATE_WIDGET,
  UPDATE_WIDGET_ALIGN_SYSTEM
} from "@reearth/services/gql/queries/widget";
import { useLang, useT } from "@reearth/services/i18n";
import { WidgetAreaState, useNotification } from "@reearth/services/state";
import { useCallback, useMemo } from "react";

import { MutationReturn } from "../types";

import { getInstallableWidgets, getInstalledWidgets } from "./utils";

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

export default () => {
  const t = useT();
  const lang = useLang();
  const [, setNotification] = useNotification();

  const useInstallableWidgets = useCallback(
    ({ sceneId, type }: { sceneId?: string; type: DeviceType }) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId
      });

      const installableWidgets = useMemo(
        () => getInstallableWidgets(data, type),
        [data, type]
      );

      return { installableWidgets, ...rest };
    },
    [lang]
  );

  const useInstalledWidgets = useCallback(
    ({ sceneId, type }: { sceneId?: string; type: DeviceType }) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId
      });

      const installedWidgets = useMemo(
        () => getInstalledWidgets(data, type),
        [data, type]
      );

      return { installedWidgets, ...rest };
    },
    [lang]
  );

  const [addWidgetMutation] = useMutation(ADD_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const useAddWidget = useCallback(
    async (
      sceneId?: string,
      id?: string,
      type?: WidgetAlignSystemType
    ): Promise<MutationReturn<Partial<Widget>>> => {
      if (!sceneId || !id || !type)
        return {
          status: "error"
        };

      const [pluginId, extensionId] = id.split("/");
      const { data, errors } = await addWidgetMutation({
        variables: { sceneId: sceneId ?? "", pluginId, extensionId, type }
      });

      if (errors || !data?.addWidget) {
        console.log("GraphQL: Failed to add widget", errors);
        setNotification({ type: "error", text: t("Failed to add widget.") });

        return { status: "error" };
      }

      return {
        data: data.addWidget.sceneWidget,
        status: "success"
      };
    },
    [addWidgetMutation, setNotification, t]
  );

  const [updateWidget] = useMutation(UPDATE_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const useUpdateWidget = useCallback(
    async (
      id: string,
      update: { location?: WidgetLocation; extended?: boolean; index?: number },
      sceneId?: string,
      type?: WidgetAlignSystemType
    ) => {
      if (!sceneId || !type) {
        console.log(
          "GraphQL: Failed to update widget because there is no sceneId or type provided"
        );
        setNotification({ type: "error", text: t("Failed to update widget.") });
        return {
          status: "error"
        };
      }

      const { data, errors } = await updateWidget({
        variables: {
          type,
          sceneId,
          widgetId: id,
          enabled: true,
          location: update.location
            ? {
                zone: update.location.zone?.toUpperCase() as WidgetZoneType,
                section:
                  update.location.section?.toUpperCase() as WidgetSectionType,
                area: update.location.area?.toUpperCase() as WidgetAreaType
              }
            : undefined,
          extended: update.extended,
          index: update.index
        }
      });

      if (errors || !data?.updateWidget) {
        console.log("GraphQL: Failed to update widget", errors);
        setNotification({ type: "error", text: t("Failed to update widget.") });

        return { status: "error" };
      }

      return {
        data: data.updateWidget.scene.widgets,
        status: "success"
      };
    },
    [updateWidget, setNotification, t]
  );

  const [removeWidget] = useMutation(REMOVE_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const useRemoveWidget = useCallback(
    async (
      sceneId?: string,
      widgetId?: string,
      type?: WidgetAlignSystemType
    ): Promise<MutationReturn<Partial<SceneWidget>[]>> => {
      if (!sceneId || !widgetId || !type) {
        console.log(
          "GraphQL: Failed to remove widget because there is either no sceneId, widgetId or type provided"
        );
        setNotification({ type: "error", text: t("Failed to update widget.") });
        return {
          status: "error"
        };
      }

      const { data, errors } = await removeWidget({
        variables: { sceneId: sceneId ?? "", widgetId, type }
      });

      if (errors || !data?.removeWidget) {
        console.log("GraphQL: Failed to remove widget", errors);
        setNotification({ type: "error", text: t("Failed to remove widget.") });

        return { status: "error" };
      }

      return {
        data: data.removeWidget.scene.widgets,
        status: "success"
      };
    },
    [removeWidget, setNotification, t]
  );

  const [updateWidgetAlignSystem] = useMutation(UPDATE_WIDGET_ALIGN_SYSTEM, {
    refetchQueries: ["GetScene"]
  });

  const useUpdateWidgetAlignSystem = useCallback(
    async (
      widgetAreaState: WidgetAreaState,
      sceneId?: string,
      type?: WidgetAlignSystemType
    ) => {
      if (!sceneId || !type) {
        console.log(
          "GraphQL: Failed to update the widget align system because there is no sceneId or type provided"
        );
        setNotification({
          type: "error",
          text: t("Failed to update widget alignment.")
        });
        return {
          status: "error"
        };
      }

      const { data, errors } = await updateWidgetAlignSystem({
        variables: {
          sceneId,
          location: {
            zone: widgetAreaState.zone.toUpperCase() as WidgetZoneType,
            section: widgetAreaState.section.toUpperCase() as WidgetSectionType,
            area: widgetAreaState.area.toUpperCase() as WidgetAreaType
          },
          align: widgetAreaState.align?.toUpperCase() as WidgetAreaAlign,
          background: widgetAreaState.background,
          padding: widgetAreaState.padding,
          centered: widgetAreaState.centered,
          gap: widgetAreaState.gap,
          type
        }
      });

      if (errors || !data?.updateWidgetAlignSystem) {
        console.log(
          "GraphQL: Failed to update the widget align system",
          errors
        );
        setNotification({
          type: "error",
          text: t("Failed to update the widget align system.")
        });

        return { status: "error" };
      }

      return {
        data: data.updateWidgetAlignSystem.scene.widgetAlignSystem,
        status: "success"
      };
    },
    [updateWidgetAlignSystem, setNotification, t]
  );

  return {
    useInstallableWidgets,
    useInstalledWidgets,
    useAddWidget,
    useUpdateWidget,
    useUpdateWidgetAlignSystem,
    useRemoveWidget
  };
};
