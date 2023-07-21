import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { ADD_WIDGET } from "@reearth/services/gql/queries/widget";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { SceneQueryProps } from "../sceneApi";
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

export type WidgetQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useInstallableWidgetsQuery = useCallback(({ sceneId, lang }: WidgetQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const installableWidgets = useMemo(() => getInstallableWidgets(data), [data]);

    return { installableWidgets, ...rest };
  }, []);

  const useInstalledWidgetsQuery = useCallback(({ sceneId, lang }: WidgetQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const installedWidgets = useMemo(() => getInstalledWidgets(data), [data]);

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

  return {
    useInstallableWidgetsQuery,
    useInstalledWidgetsQuery,
    useAddWidget,
  };
};
