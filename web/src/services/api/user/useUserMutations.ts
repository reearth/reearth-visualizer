import { useMutation } from "@apollo/client";
import { DELETE_ME } from "@reearth/services/gql/queries/user";
import { useCallback } from "react";

import { useT } from "../../i18n";
import { useNotification } from "../../state";

export const useUserMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [deleteMeMutation] = useMutation(DELETE_ME);
  const deleteUser = useCallback(
    async ({ userId }: { userId: string }) => {
      const { data, errors } = await deleteMeMutation({
        variables: { userId }
      });
      if (errors || !data?.deleteMe) {
        console.log("GraphQL: Failed to delete users", errors);
        setNotification({
          type: "error",
          text: t("Failed to delete user.")
        });
        return { status: "error" };
      }
      setNotification({
        type: "success",
        text: t("Successfully delete user!")
      });
      return { data: data.deleteMe, status: "success" };
    },
    [deleteMeMutation, setNotification, t]
  );

  return {
    deleteUser
  };
};
