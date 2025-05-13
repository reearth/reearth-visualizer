import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CustomOptions, MutationReturn } from "@reearth/services/api/types";
import { HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION } from "@reearth/services/gql";
import {
  CreateStoryInput,
  CreateStoryMutation,
  MutationCreateStoryArgs,
  UpdateStoryInput
} from "@reearth/services/gql/__gen__/graphql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import {
  CHECK_STORY_ALIAS,
  CREATE_STORY,
  PUBLISH_STORY,
  UPDATE_STORY
} from "@reearth/services/gql/queries/storytelling";
import { useLang, useT } from "@reearth/services/i18n";
import { useCallback, useMemo } from "react";

import { useNotification } from "../../state";
import { PublishStatus, toGqlStatus } from "../publishTypes";
import { SceneQueryProps } from "../sceneApi";

import useBlocks from "./blocks";
import usePages from "./pages";
import { getStories } from "./utils";

export type StoryQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const lang = useLang();
  const [, setNotification] = useNotification();

  const useStoriesQuery = useCallback(
    ({ sceneId }: StoryQueryProps, options?: CustomOptions) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId || options?.skip
      });

      const stories = useMemo(() => getStories(data), [data]);

      return { stories, ...rest };
    },
    [lang]
  );

  const [createStoryMutation] = useMutation<
    CreateStoryMutation,
    MutationCreateStoryArgs
  >(CREATE_STORY);
  const useCreateStory = useCallback(
    async (
      input: CreateStoryInput
    ): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, errors } = await createStoryMutation({
        variables: { input }
      });
      if (errors || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully created a story!")
      });

      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t]
  );

  const [updateStoryMutation] = useMutation(UPDATE_STORY, {
    refetchQueries: ["GetScene"]
  });
  const useUpdateStory = useCallback(
    async (input: UpdateStoryInput) => {
      if (!input.storyId) return { status: "error" };
      const { data, errors } = await updateStoryMutation({
        variables: { input }
      });
      if (errors || !data?.updateStory) {
        setNotification({ type: "error", text: t("Failed to update story.") });

        return { status: "error", errors };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated a story!")
      });

      return { data, status: "success" };
    },
    [updateStoryMutation, t, setNotification]
  );

  const [publishStoryMutation, { loading: publishStoryLoading }] =
    useMutation(PUBLISH_STORY);

  const usePublishStory = useCallback(
    async (s: PublishStatus, storyId?: string, alias?: string) => {
      if (!storyId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishStoryMutation({
        variables: { storyId, alias, status: gqlStatus }
      });

      if (errors || !data?.publishStory) {
        setNotification({ type: "error", text: t("Failed to publish story.") });

        return { status: "error" };
      }

      setNotification({
        type:
          s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully published your story!")
            : s == "published"
              ? t(
                  "Successfully published your story with search engine indexing!"
                )
              : t(
                  "Successfully unpublished your story. Now nobody can access your story."
                )
      });
      return { data: data.publishStory.story, status: "success" };
    },
    [publishStoryMutation, t, setNotification]
  );

  const useUpdatePublishStory = useCallback(
    async (s: PublishStatus, storyId?: string, alias?: string) => {
      if (!storyId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishStoryMutation({
        variables: { storyId, alias, status: gqlStatus }
      });

      if (errors || !data?.publishStory) {
        setNotification({ type: "error", text: t("Failed to update story.") });

        return { status: "error" };
      }

      setNotification({
        type:
          s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully updated your story!")
            : s == "published"
              ? t(
                  "Successfully updated your story with search engine indexing!"
                )
              : t(
                  "Successfully updated your story. Now nobody can access your story."
                )
      });
      return { data: data.publishStory.story, status: "success" };
    },
    [publishStoryMutation, t, setNotification]
  );

  const [fetchCheckProjectAlias] = useLazyQuery(CHECK_STORY_ALIAS, {
    fetchPolicy: "network-only" // Disable caching for this query
  });

  const checkStoryAlias = useCallback(
    async (alias: string, storyId?: string) => {
      if (!alias) return null;

      const { data, errors } = await fetchCheckProjectAlias({
        variables: { alias, storyId },
        errorPolicy: "all",
        context: {
          headers: {
            [HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION]: "true"
          }
        }
      });

      if (errors || !data?.checkStoryAlias) {
        return { status: "error", errors };
      }

      setNotification({
        type: "success",
        text: t("Successfully checked alias!")
      });
      return {
        available: data?.checkStoryAlias.available,
        alias: data?.checkStoryAlias.alias,
        status: "success"
      };
    },
    [fetchCheckProjectAlias, setNotification, t]
  );

  const {
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useUpdateStoryPage
  } = usePages();

  const {
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock
  } = useBlocks();

  return {
    publishStoryLoading,
    useStoriesQuery,
    useCreateStory,
    useUpdateStory,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
    useUpdateStoryPage,
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock,
    usePublishStory,
    useUpdatePublishStory,
    checkStoryAlias
  };
};
