import { useQuery } from "@apollo/client";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import { Plugin } from "./types";

export const usePlugins = (sceneId?: string) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const plugins: Plugin[] | undefined = useMemo(
    () =>
      data?.node?.__typename === "Scene"
        ? (data.node.plugins
            .map((p) => {
              if (!p.plugin) return;

              return {
                id: p.plugin.id,
                name: p.plugin.name,
                translatedName: p.plugin.translatedName,
                description: p.plugin.description,
                translatedDescription: p.plugin.translatedDescription,
                version: p.plugin.version,
                author: p.plugin.author,
                extensions: p.plugin.extensions.map((e) => {
                  return {
                    pluginId: p.plugin?.id,
                    ...e
                  };
                }),
                property: p.property
                  ? {
                      id: p.property.id,
                      items: p.property.items,
                      schema: p.property.schema
                    }
                  : {}
              };
            })
            .filter((p) => !!p) as Plugin[])
        : undefined,
    [data?.node]
  );

  return { plugins, ...rest };
};
