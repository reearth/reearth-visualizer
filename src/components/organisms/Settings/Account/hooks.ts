import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";

import { useUpdateMeMutation, useProfileQuery } from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";

export enum Theme {
  Default = "DEFAULT",
  Light = "LIGHT",
  Dark = "DARK",
}

export default () => {
  const client = useApolloClient();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const { data: profileData } = useProfileQuery();
  const me = profileData?.me;
  const auths = profileData?.me?.auths;
  const hasPassword = auths?.includes("auth0") ?? false;

  const [updateMeMutation] = useUpdateMeMutation();

  const updateName = useCallback(
    (name: string) => {
      updateMeMutation({ variables: { name } });
    },
    [updateMeMutation],
  );

  const updatePassword = useCallback(
    (password: string, passwordConfirmation: string) => {
      updateMeMutation({ variables: { password, passwordConfirmation } });
    },
    [updateMeMutation],
  );

  const updateLanguage = useCallback(
    async (lang: string) => {
      await updateMeMutation({ variables: { lang } });
      await client.resetStore();
    },
    [updateMeMutation, client],
  );

  const updateTheme = useCallback(
    (theme: string) => {
      updateMeMutation({ variables: { theme: theme as Theme } });
    },
    [updateMeMutation],
  );

  return {
    currentTeam,
    currentProject,
    me,
    hasPassword,
    updateName,
    updatePassword,
    updateLanguage,
    updateTheme,
  };
};
