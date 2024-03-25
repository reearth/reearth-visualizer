import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { AVAILABLE_INFOBOX_BLOCK_IDS } from "@reearth/beta/lib/core/Crust/Infobox/constants";
import {
  AddNlsInfoboxBlockInput,
  AddNlsInfoboxBlockMutation,
  GetSceneQuery,
  MoveNlsInfoboxBlockInput,
  MoveNlsInfoboxBlockMutation,
  MutationAddNlsInfoboxBlockArgs,
  MutationMoveNlsInfoboxBlockArgs,
  MutationRemoveNlsInfoboxBlockArgs,
  PluginExtensionType,
  RemoveNlsInfoboxBlockInput,
  RemoveNlsInfoboxBlockMutation,
} from "@reearth/services/gql";
import {
  ADD_NLSINFOBOX_BLOCK,
  MOVE_NLSINFOBOX_BLOCK,
  REMOVE_NLSINFOBOX_BLOCK,
} from "@reearth/services/gql/queries/infobox";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { Item } from "../propertyApi/utils";
import { SceneQueryProps } from "../sceneApi";
import { MutationReturn } from "../types";

export type InfoboxBlockQueryProps = SceneQueryProps;

export type InstallableInfoboxBlock = {
  name: string;
  description?: string;
  pluginId: string;
  extensionId: string;
  icon?: string;
  singleOnly?: boolean;
  type?: "InfoboxBlock";
};

export type InstalledInfoboxBlock = {
  id: string;
  pluginId: string;
  extensionId: string;
  name: string;
  description: string | undefined;
  icon?: string;
  property?: {
    id: string;
    items: Item[] | undefined;
  };
};

export default () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const useInstallableInfoboxBlocksQuery = useCallback(
    ({ sceneId, lang }: InfoboxBlockQueryProps) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId,
      });

      const installableInfoboxBlocks = useMemo(() => getInstallableInfoboxBlocks(data), [data]);

      return { installableInfoboxBlocks, ...rest };
    },
    [],
  );

  const [createInfoboxBlockMutation] = useMutation<
    AddNlsInfoboxBlockMutation,
    MutationAddNlsInfoboxBlockArgs
  >(ADD_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const useCreateInfoboxBlock = useCallback(
    async (input: AddNlsInfoboxBlockInput): Promise<MutationReturn<AddNlsInfoboxBlockMutation>> => {
      const { data, errors } = await createInfoboxBlockMutation({ variables: { input } });
      if (errors || !data?.addNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to create block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfullly created a block!") });

      return { data, status: "success" };
    },
    [createInfoboxBlockMutation, setNotification, t],
  );

  const [removeInfoboxBlockMutation] = useMutation<
    RemoveNlsInfoboxBlockMutation,
    MutationRemoveNlsInfoboxBlockArgs
  >(REMOVE_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const useDeleteInfoboxBlock = useCallback(
    async (
      input: RemoveNlsInfoboxBlockInput,
    ): Promise<MutationReturn<RemoveNlsInfoboxBlockMutation>> => {
      const { data, errors } = await removeInfoboxBlockMutation({ variables: { input } });
      if (errors || !data?.removeNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to delete block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Block was successfully deleted.") });

      return { data, status: "success" };
    },
    [removeInfoboxBlockMutation, setNotification, t],
  );

  const [moveInfoboxBlockMutation] = useMutation<
    MoveNlsInfoboxBlockMutation,
    MutationMoveNlsInfoboxBlockArgs
  >(MOVE_NLSINFOBOX_BLOCK, { refetchQueries: ["GetScene"] });

  const useMoveInfoboxBlock = useCallback(
    async (
      input: MoveNlsInfoboxBlockInput,
    ): Promise<MutationReturn<MoveNlsInfoboxBlockMutation>> => {
      const { data, errors } = await moveInfoboxBlockMutation({ variables: { input } });
      if (errors || !data?.moveNLSInfoboxBlock) {
        setNotification({ type: "error", text: t("Failed to move block.") });

        return { status: "error", errors };
      }
      setNotification({ type: "info", text: t("Block was successfully moved.") });

      return { data, status: "success" };
    },
    [moveInfoboxBlockMutation, setNotification, t],
  );

  return {
    useInstallableInfoboxBlocksQuery,
    useCreateInfoboxBlock,
    useDeleteInfoboxBlock,
    useMoveInfoboxBlock,
  };
};

const getInstallableInfoboxBlocks = (rawScene?: GetSceneQuery) => {
  const scene = rawScene?.node?.__typename === "Scene" ? rawScene.node : undefined;
  return scene?.plugins
    .map(p => {
      const plugin = p.plugin;
      return plugin?.extensions
        .filter(
          e =>
            e.type === PluginExtensionType.InfoboxBlock &&
            (AVAILABLE_INFOBOX_BLOCK_IDS.includes(`reearth/${e.extensionId}`) ||
              plugin.id !== "reearth"),
        )
        .map((e): InstallableInfoboxBlock => {
          return {
            name: e.translatedName ?? e.name,
            description: e.translatedDescription ?? e.description,
            pluginId: plugin.id,
            extensionId: e.extensionId,
            icon: e.extensionId,
            singleOnly: !!e.singleOnly,
            type: "InfoboxBlock",
          };
        })
        .filter((sb): sb is InstallableInfoboxBlock => !!sb);
    })
    .reduce<InstallableInfoboxBlock[]>((a, b) => (b ? [...a, ...b] : a), []);
};
