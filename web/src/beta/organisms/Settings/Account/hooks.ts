import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import { useUpdateMeMutation, useGetProfileQuery, Theme as GQLTheme } from "@reearth/classic/gql";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, useProject, useNotification } from "@reearth/services/state";

const enumTypeMapper: Partial<Record<GQLTheme, string>> = {
  [GQLTheme.Default]: "default",
  [GQLTheme.Dark]: "dark",
  [GQLTheme.Light]: "light",
};

export type Theme = "dark" | "light" | "default";

function toGQLEnum(val?: Theme) {
  if (!val) return;
  return (Object.keys(enumTypeMapper) as GQLTheme[]).find(k => enumTypeMapper[k] === val);
}

export default () => {
  const t = useT();
  const [, setNotification] = useNotification();
  const client = useApolloClient();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();

  const { data: profileData } = useGetProfileQuery();
  const me = profileData?.me;
  const auths = profileData?.me?.auths;
  const hasPassword = auths?.includes("auth0") ?? false;
  const passwordPolicy = window.REEARTH_CONFIG?.passwordPolicy;

  const [updateMeMutation] = useUpdateMeMutation();

  const updateName = useCallback(
    async (name?: string) => {
      if (!name) return;
      const username = await updateMeMutation({ variables: { name } });
      if (username.errors) {
        setNotification({
          type: "error",
          text: t("Failed to update account name."),
        });
      }
    },
    [updateMeMutation, t, setNotification],
  );

  const updatePassword = useCallback(
    async (password: string, passwordConfirmation: string) => {
      const newPassword = await updateMeMutation({ variables: { password, passwordConfirmation } });
      if (newPassword.errors) {
        setNotification({
          type: "error",
          text: t("Failed to update password."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully updated password!"),
        });
      }
    },
    [updateMeMutation, t, setNotification],
  );

  const updateLanguage = useCallback(
    async (lang?: string) => {
      if (!lang) return;
      const language = await updateMeMutation({ variables: { lang } });
      if (language.errors) {
        setNotification({
          type: "error",
          text: t("Failed to change language."),
        });
      } else {
        await client.resetStore();
      }
    },
    [updateMeMutation, t, setNotification, client],
  );

  const updateTheme = useCallback(
    async (theme: Theme) => {
      const newTheme = await updateMeMutation({ variables: { theme: toGQLEnum(theme) } });
      if (newTheme.errors) {
        setNotification({
          type: "error",
          text: t("Failed to change theme."),
        });
      }
    },
    [updateMeMutation, t, setNotification],
  );

  return {
    currentWorkspace,
    currentProject,
    me,
    hasPassword,
    passwordPolicy,
    updateName,
    updatePassword,
    updateLanguage,
    updateTheme,
  };
};
