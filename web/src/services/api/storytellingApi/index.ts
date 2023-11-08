import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { PublishStatus } from "@reearth/beta/features/Editor/tabs/publish/Nav/PublishModal/hooks";
import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryInput,
  CreateStoryMutation,
  MutationCreateStoryArgs,
  UpdateStoryInput,
} from "@reearth/services/gql/__gen__/graphql";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import {
  CREATE_STORY,
  PUBLISH_STORY,
  UPDATE_STORY,
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../../state";
import { SceneQueryProps } from "../sceneApi";
import { toGqlStatus } from "../toGqlStatus";

import useBlocks from "./blocks";
import usePages from "./pages";
import { getStories } from "./utils";

export type StoryQueryProps = SceneQueryProps;

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useStoriesQuery = useCallback(({ sceneId, lang }: StoryQueryProps) => {
    const { data, ...rest } = useQuery(GET_SCENE, {
      variables: { sceneId: sceneId ?? "", lang },
      skip: !sceneId,
    });

    const stories = useMemo(() => getStories(data), [data]);

    return { stories, ...rest };
  }, []);

  const [createStoryMutation] = useMutation<CreateStoryMutation, MutationCreateStoryArgs>(
    CREATE_STORY,
  );
  const useCreateStory = useCallback(
    async (input: CreateStoryInput): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, errors } = await createStoryMutation({ variables: { input } });
      if (errors || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully created a story!") });

      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  const [updateStoryMutation] = useMutation(UPDATE_STORY, { refetchQueries: ["GetScene"] });
  const useUpdateStory = useCallback(
    async (input: UpdateStoryInput) => {
      if (!input.storyId) return { status: "error" };
      const { data, errors } = await updateStoryMutation({ variables: { input } });
      if (errors || !data?.updateStory) {
        setNotification({ type: "error", text: t("Failed to update story.") });

        return { status: "error", errors };
      }
      setNotification({ type: "success", text: t("Successfully updated a story!") });

      return { data, status: "success" };
    },
    [updateStoryMutation, t, setNotification],
  );

  const [publishStoryMutation, { loading: publishStoryLoading }] = useMutation(PUBLISH_STORY);

  const usePublishStory = useCallback(
    async (s: PublishStatus, storyId?: string, alias?: string) => {
      if (!storyId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, errors } = await publishStoryMutation({
        variables: { storyId, alias, status: gqlStatus },
      });

      if (errors || !data?.publishStory) {
        setNotification({ type: "error", text: t("Failed to publish story.") });

        return { status: "error" };
      }

      setNotification({
        type: s === "limited" ? "success" : s == "published" ? "success" : "info",
        text:
          s === "limited"
            ? t("Successfully published your story!")
            : s == "published"
            ? t("Successfully published your story with search engine indexing!")
            : t("Successfully unpublished your story. Now nobody can access your story."),
      });
      return { data: data.publishStory.story, status: "success" };
    },
    [publishStoryMutation, t, setNotification],
  );

  const { useCreateStoryPage, useDeleteStoryPage, useMoveStoryPage, useUpdateStoryPage } =
    usePages();

  const {
    useInstallableStoryBlocksQuery,
    useInstalledStoryBlocksQuery,
    useCreateStoryBlock,
    useDeleteStoryBlock,
    useMoveStoryBlock,
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
  };
};
