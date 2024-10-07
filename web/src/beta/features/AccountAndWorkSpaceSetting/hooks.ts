import { useMeFetcher } from "@reearth/services/api";
import { useCallback } from "react";

export type UpdatePasswordType = {
  password: string;
  passwordConfirmation: string;
};

export default () => {
  const { useMeQuery, useUpdatePassword, updateLanguage, useDeleteUser } =
    useMeFetcher();

  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

  const { me: data } = useMeQuery();

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

  const handleUpdateUserLanguage = useCallback(
    async ({ lang }: { lang: string }) => {
      try {
        await updateLanguage(lang);
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    },
    [updateLanguage]
  );

  const handleDeleteUser = useCallback(async () => {
    try {
      const userId = data.id;
      if (userId) await useDeleteUser({ userId });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }, [data.id, useDeleteUser]);

  return {
    meData: data,
    passwordPolicy,
    handleUpdateUserPassword,
    handleUpdateUserLanguage,
    handleDeleteUser
  };
};
