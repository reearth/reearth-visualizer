import { useMutation } from "@apollo/client";
import { useCallback } from "react";

import { MutationReturn } from "@reearth/services/api/types";
import {
  CreateStoryInput,
  CreateStoryMutation,
  MutationCreateStoryArgs,
} from "@reearth/services/gql/__gen__/graphql";
import { CREATE_STORY } from "@reearth/services/gql/queries/storytelling";
import { useT } from "@reearth/services/i18n";

import { useNotification } from "../../state";

import usePages from "./pages";

export default function useStorytellingAPI() {
  const t = useT();
  const [, setNotification] = useNotification();

  const { useCreateStoryPage, useDeleteStoryPage, useMoveStoryPage } = usePages();

  const [createStoryMutation] = useMutation<CreateStoryMutation, MutationCreateStoryArgs>(
    CREATE_STORY,
  );
  const useCreateStory = useCallback(
    async (input: CreateStoryInput): Promise<MutationReturn<CreateStoryMutation>> => {
      const { data, errors } = await createStoryMutation({
        variables: {
          input,
        },
      });
      if (errors || !data?.createStory?.story?.id) {
        setNotification({ type: "error", text: t("Failed to create story.") });

        return { status: "error", errors };
      }
      return { data, status: "success" };
    },
    [createStoryMutation, setNotification, t],
  );

  return {
    useCreateStory,
    useCreateStoryPage,
    useDeleteStoryPage,
    useMoveStoryPage,
  };
}
