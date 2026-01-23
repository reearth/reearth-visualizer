import { useMe, useMeMutations } from "@reearth/services/api/user";
import { useCallback } from "react";

type UpdatePasswordType = {
  password: string;
  passwordConfirmation: string;
};

export default () => {
  const { updatePassword, updateLanguage } = useMeMutations();
  const { me: data } = useMe();

  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

  const handleUpdateUserPassword = useCallback(
    async ({ password, passwordConfirmation }: UpdatePasswordType) => {
      try {
        await updatePassword({ password, passwordConfirmation });
      } catch (error) {
        console.error("Failed to update password:", error);
      }
    },
    [updatePassword]
  );

  const handleUpdateUserLanguage = useCallback(
    async ({ lang }: { lang: string }) => {
      try {
        await updateLanguage(lang);
      } catch (error) {
        console.error("Failed to update language:", error);
      }
    },
    [updateLanguage]
  );

  return {
    meData: data,
    passwordPolicy,
    handleUpdateUserPassword,
    handleUpdateUserLanguage
  };
};
