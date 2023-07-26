import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import {
  CreateStoryInput,
  CreateStoryMutation,
  CreateTeamPayload,
  MutationCreateStoryArgs,
} from "@reearth/services/gql/__gen__/graphql";
import { CREATE_STORY } from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../state";

export type Team = CreateTeamPayload["team"];

export default function useStorytellingAPI() {
  const t = useT();
  const [, setNotification] = useNotification();

  const [createStoryMutation] = useMutation<CreateStoryMutation, MutationCreateStoryArgs>(
    CREATE_STORY,
  );
  const createStory = useCallback(
    async (input: CreateStoryInput, opt?: { disableNotification?: boolean }) => {
      const { data, errors } = await createStoryMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStory?.story?.id) {
        console.log("GraphQL: Failed to create story", errors);
        if (!opt?.disableNotification) {
          setNotification({ type: "error", text: t("Failed to create story.") });
        }

        return { status: "error", errors };
      }

      if (!opt?.disableNotification) {
        setNotification({ type: "success", text: t("Successfully created story!") });
      }
      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  return {
    createStory,
  };
}
