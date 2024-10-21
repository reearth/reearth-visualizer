import { useMeFetcher } from "@reearth/services/api";
import { useCallback } from "react";

type UpdatePasswordType = {
  password: string;
  passwordConfirmation: string;
};

export default () => {
  const { useMeQuery, useUpdatePassword, useDeleteUser, useUpdateLanguage } =
    useMeFetcher();
  const { me: data } = useMeQuery();

  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

  const handleUpdateUserPassword = useCallback(
    async ({ password, passwordConfirmation }: UpdatePasswordType) => {
      try {
        await useUpdatePassword({ password, passwordConfirmation });
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    },
    [useUpdatePassword]
  );

  const handleDeleteUser = useCallback(async () => {
    try {
      const userId = data.id;
      if (userId) await useDeleteUser({ userId });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }, [data.id, useDeleteUser]);

  const handleUpdateUserLanguage = useCallback(
    async ({ lang }: { lang: string }) => {
      try {
        await useUpdateLanguage(lang);
      } catch (error) {
        console.error("Failed to update language:", error);
      }
    },
    [useUpdateLanguage]
  );

  return {
    meData: data,
    passwordPolicy,
    handleUpdateUserPassword,
    handleDeleteUser,
    handleUpdateUserLanguage
  };
};
