import { useQuery } from "@apollo/client/react";
import { AVAILABLE_INFOBOX_BLOCK_IDS } from "@reearth/app/features/Visualizer/Crust/Infobox/constants";
import { GetSceneQuery, PluginExtensionType } from "@reearth/services/gql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useLang } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import { SceneQueryProps } from "../scene";

import { InstallableInfoboxBlock } from "./types";

// Note: Infobox blocks data comes from scene query
export const useInstallableInfoboxBlocks = ({ sceneId }: SceneQueryProps) => {
  const lang = useLang();

  const { data, ...rest } = useQuery(GET_SCENE, {
    variables: { sceneId: sceneId ?? "", lang },
    skip: !sceneId
  });

  const installableInfoboxBlocks = useMemo(
    () => getInstallableInfoboxBlocks(data),
    [data]
  );

  return { installableInfoboxBlocks, ...rest };
};

const getInstallableInfoboxBlocks = (rawScene?: GetSceneQuery) => {
  const scene =
    rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.plugins
    .map((p) => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter(
          (e) =>
            e.type === PluginExtensionType.InfoboxBlock &&
            (AVAILABLE_INFOBOX_BLOCK_IDS.includes(`reearth/${e.extensionId}`) ||
              plugin.id !== "reearth")
        )
        .map((e): InstallableInfoboxBlock => {
          return {
            name: e.translatedName ?? e.name,
            description: e.translatedDescription ?? e.description,
            pluginId: plugin.id,
            extensionId: e.extensionId,
            icon: e.extensionId,
            singleOnly: !!e.singleOnly,
            type: "InfoboxBlock"
          };
        })
        .filter((sb): sb is InstallableInfoboxBlock => !!sb);
    })
    .reduce<InstallableInfoboxBlock[]>((a, b) => (b ? [...a, ...b] : a), []);
};
