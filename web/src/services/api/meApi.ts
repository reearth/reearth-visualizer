import { useMutation, useQuery } from "@apollo/client";
import {
  GET_ME,
  DELETE_ME,
  UPDATE_ME
} from "@reearth/services/gql/queries/user";
import { useCallback } from "react";

import { useT } from "../i18n";
import { useNotification } from "../state";

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const useMeQuery = useCallback((options?: { skip?: boolean }) => {
    const { data, ...rest } = useQuery(GET_ME, { ...options });
    return {
      me: { ...data?.me },
      ...rest
    };
  }, []);

  const [updateMeMutation] = useMutation(UPDATE_ME);
  const useUpdatePassword = useCallback(
    async ({
      password,
      passwordConfirmation
    }: {
      password: string;
      passwordConfirmation: string;
    }) => {
      const { data, errors } = await updateMeMutation({
        variables: {
          password,
          passwordConfirmation
        }
      });

      if (errors || !data?.updateMe) {
        console.log("GraphQL: Failed to update password", errors);
        setNotification({
          type: "error",
          text: t("Failed to update user password.")
        });
        return { status: "error" };
      }
      setNotification({
        type: "success",
        text: t("Successfully updated user password!")
      });
      return { data: data?.updateMe, status: "success" };
    },
    [setNotification, t, updateMeMutation]
  );

  const [deleteMeMutation] = useMutation(DELETE_ME);
  const useDeleteUser = useCallback(
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
    useMeQuery,
    useUpdatePassword,
    useDeleteUser
  };
};
