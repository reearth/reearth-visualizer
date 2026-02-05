import { useMutation } from "@apollo/client/react";
import { UPDATE_ME } from "@reearth/services/gql/queries/user";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback } from "react";

import { useNotification } from "../../state";

export const useMeMutations = () => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [updateMeMutation] = useMutation(UPDATE_ME);
  const updatePassword = useCallback(
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

  const updateLanguage = useCallback(
    async (lang: string) => {
      if (!lang) return;
      const { data, errors } = await updateMeMutation({ variables: { lang } });
      if (errors || !data?.updateMe) {
        console.log("GraphQL: Failed to update language", errors);
        setNotification({
          type: "error",
          text: t("Failed to change language.")
        });
        return { status: "error" };
      } else {
        setNotification({
          type: "success",
          text: t("Successfully updated user language!")
        });
        return { data: data?.updateMe, status: "success" };
      }
    },
    [updateMeMutation, t, setNotification]
  );

  return {
    updatePassword,
    updateLanguage
  };
};
