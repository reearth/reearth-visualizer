import { useMeFetcher } from "@reearth/services/api";
import { useCallback } from "react";

export type UpdatePasswordType = {
  password: string;
  passwordConfirmation: string;
};

export default () => {
  const { useMeQuery, useUpdatePassword, useDeleteUser } = useMeFetcher();

  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

  const { me: data } = useMeQuery();

  const handleUpdateUserPassword = useCallback(
    async ({ password, passwordConfirmation }: UpdatePasswordType) => {
      await useUpdatePassword({ password, passwordConfirmation });
    },
    [useUpdatePassword]
  );

  const handleDeleteUser = useCallback(async () => {
    const userId = data.id;
    if (userId) await useDeleteUser({ userId });
  }, [data.id, useDeleteUser]);

  return {
    meData: data,
    passwordPolicy,
    handleUpdateUserPassword,
    handleDeleteUser
  };
};
