import { useMutation } from "@apollo/client/react";
import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryInput,
  CreateStoryMutation,
  MutationCreateStoryArgs,
  UpdateStoryInput
} from "@reearth/services/gql/__gen__/graphql";
import {
  CREATE_STORY,
  PUBLISH_STORY,
  UPDATE_STORY
} from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback } from "react";

import { useNotification } from "../../state";
import { PublishStatus, toGqlStatus } from "../utils";

export const useStoryMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createStoryMutation] = useMutation<
    CreateStoryMutation,
    MutationCreateStoryArgs
  >(CREATE_STORY);
  const createStory = useCallback(
    async (
      input: CreateStoryInput
    ): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, error } = await createStoryMutation({
        variables: { input }
      });
      if (error || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", error };
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
  const updateStory = useCallback(
    async (input: UpdateStoryInput) => {
      if (!input.storyId) return { status: "error" };
      const { data, error } = await updateStoryMutation({
        variables: { input }
      });
      if (error || !data?.updateStory) {
        setNotification({ type: "error", text: t("Failed to update story.") });

        return { status: "error", error };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated a story!")
      });

      return { data, status: "success" };
    },
    [updateStoryMutation, t, setNotification]
  );

  const [publishStoryMutation] = useMutation(PUBLISH_STORY);

  const publishStory = useCallback(
    async (s: PublishStatus, storyId?: string, alias?: string) => {
      if (!storyId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, error } = await publishStoryMutation({
        variables: { storyId, alias, status: gqlStatus }
      });

      if (error || !data?.publishStory) {
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

  const updatePublishStory = useCallback(
    async (s: PublishStatus, storyId?: string, alias?: string) => {
      if (!storyId) return;

      const gqlStatus = toGqlStatus(s);

      const { data, error } = await publishStoryMutation({
        variables: { storyId, alias, status: gqlStatus }
      });

      if (error || !data?.publishStory) {
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

  return {
    createStory,
    updateStory,
    publishStory,
    updatePublishStory
  };
};
