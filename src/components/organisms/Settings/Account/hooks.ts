import { useCallback } from "react";
import { useLocalState } from "@reearth/state";
import { useUpdateMeMutation, useProfileQuery } from "@reearth/gql";

export default () => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));

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
    (lang: string) => {
      updateMeMutation({ variables: { lang } });
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
  };
};
