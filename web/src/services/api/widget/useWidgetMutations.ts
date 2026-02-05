import { useMutation } from "@apollo/client";
import {
  SceneWidget,
  WidgetAlignSystemType,
  WidgetAreaAlign,
  WidgetAreaType,
  WidgetSectionType,
  WidgetZoneType
} from "@reearth/services/gql";
import {
  ADD_WIDGET,
  REMOVE_WIDGET,
  UPDATE_WIDGET,
  UPDATE_WIDGET_ALIGN_SYSTEM
} from "@reearth/services/gql/queries/widget";
import { useT } from "@reearth/services/i18n";
import { WidgetAreaState, useNotification } from "@reearth/services/state";
import { useCallback } from "react";

import { MutationReturn } from "../types";

import { WidgetLocation } from "./types";

export const useWidgetMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [addWidgetMutation] = useMutation(ADD_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const addWidget = useCallback(
    async (
      sceneId?: string,
      id?: string,
      type?: WidgetAlignSystemType
    ): Promise<MutationReturn<Partial<SceneWidget>>> => {
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

  const [updateWidgetMutation] = useMutation(UPDATE_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const updateWidget = useCallback(
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

      const { data, errors } = await updateWidgetMutation({
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
    [updateWidgetMutation, setNotification, t]
  );

  const [removeWidgetMutation] = useMutation(REMOVE_WIDGET, {
    refetchQueries: ["GetScene"]
  });

  const removeWidget = useCallback(
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

      const { data, errors } = await removeWidgetMutation({
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
    [removeWidgetMutation, setNotification, t]
  );

  const [updateWidgetAlignSystemMutation] = useMutation(
    UPDATE_WIDGET_ALIGN_SYSTEM,
    {
      refetchQueries: ["GetScene"]
    }
  );

  const updateWidgetAlignSystem = useCallback(
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

      const { data, errors } = await updateWidgetAlignSystemMutation({
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
    [updateWidgetAlignSystemMutation, setNotification, t]
  );

  return {
    addWidget,
    updateWidget,
    updateWidgetAlignSystem,
    removeWidget
  };
};
