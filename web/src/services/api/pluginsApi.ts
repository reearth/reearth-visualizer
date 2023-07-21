import { useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { GET_SCENE } from "@reearth/services/gql/queries/scene";

import { WidgetLayout } from "./widgetsApi";

export enum PluginExtensionType {
  Block = "BLOCK",
  Infobox = "INFOBOX",
  Primitive = "PRIMITIVE",
  Visualizer = "VISUALIZER",
  Widget = "WIDGET",
}

export type Extension = {
  extensionId: string;
  pluginId: string;
  name: string;
  description: string;
  singleOnly?: boolean;
  type: PluginExtensionType;
  // visualizer?: string;
  widgetLayout?: WidgetLayout;
};

export type Plugin = {
  id: string;
  name: string;
  extensions: Extension[];
  property?: unknown;
};

export default () => {
  const usePluginsQuery = useCallback((sceneId?: string, lang?: string) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const plugins: Plugin[] | undefined = useMemo(
      () =>
        data?.node?.__typename === "Scene"
          ? (data.node.plugins
              .map(p => {
                if (!p.plugin) return;

                return {
                  id: p.plugin.id,
                  name: p.plugin.name,
                  extensions: p.plugin.extensions.map(e => {
                    return {
                      pluginId: p.plugin?.id,
                      ...e,
                    };
                  }),
                  property: p.property
                    ? {
                        id: p.property.id,
                        items: p.property.items,
                        schema: p.property.schema,
                      }
                    : {},
                };
              })
              .filter(p => !!p) as Plugin[])
          : undefined,
      [data?.node],
    );

    return { plugins, ...rest };
  }, []);

  return {
    usePluginsQuery,
  };
};
