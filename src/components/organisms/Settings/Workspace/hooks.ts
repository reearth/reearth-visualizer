import { useNavigate } from "@reach/router";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { Role as RoleUnion } from "@reearth/components/molecules/Settings/Workspace/MemberListItem";
import {
  useTeamsQuery,
  useSearchUserLazyQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useUpdateMemberOfTeamMutation,
  Role,
  useRemoveMemberFromTeamMutation,
} from "@reearth/gql";
import { Team } from "@reearth/gql/graphql-client-api";
import { useTeam, useProject, useNotification } from "@reearth/state";

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const intl = useIntl();
  const [currentTeam, setTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const navigate = useNavigate();
  const [searchedUser, changeSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useTeamsQuery();
  const me = { id: data?.me?.id, myTeam: data?.me?.myTeam.id };
  const teams = data?.me?.teams as Team[];

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}`);
    }
  }, [params, currentTeam, navigate]);

  const teamId = currentTeam?.id;

  const [searchUserQuery, { data: searchUserData }] = useSearchUserLazyQuery();

  useEffect(() => {
    changeSearchedUser(searchUserData?.searchUser ?? undefined);
  }, [searchUserData?.searchUser]);

  const searchUser = useCallback(
    (nameOrEmail: string) => nameOrEmail && searchUserQuery({ variables: { nameOrEmail } }),
    [searchUserQuery],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      const team = results.data?.createTeam?.team;
      if (results.errors || !results.data?.createTeam) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create workspace." }),
        });
      } else {
        setTeam(team);
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Sucessfully created a workspace!" }),
        });
      }
      setModalShown(false);
    },
    [createTeamMutation, setTeam, intl, setNotification],
  );

  const [updateTeamMutation] = useUpdateTeamMutation();

  const updateName = useCallback(
    async (name?: string) => {
      if (!teamId || !name) return;
      const results = await updateTeamMutation({ variables: { teamId, name } });
      if (results.errors) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to update workspace name." }),
        });
      } else {
        setTeam(results.data?.updateTeam?.team);
        setNotification({
          type: "info",
          text: intl.formatMessage({ defaultMessage: "You have changed the workspace's name." }),
        });
      }
    },
    [teamId, updateTeamMutation, intl, setNotification, setTeam],
  );

  const [deleteTeamMutation] = useDeleteTeamMutation({
    refetchQueries: ["teams"],
  });
  const deleteTeam = useCallback(async () => {
    if (!teamId) return;
    const result = await deleteTeamMutation({ variables: { teamId } });
    if (result.errors || !result.data?.deleteTeam) {
      setNotification({
        type: "error",
        text: intl.formatMessage({ defaultMessage: "Failed to delete workspace." }),
      });
    } else {
      setNotification({
        type: "info",
        text: intl.formatMessage({ defaultMessage: "Workspace was successfully deleted." }),
      });
      setTeam(teams[0]);
    }
  }, [teamId, setTeam, teams, deleteTeamMutation, intl, setNotification]);

  const [addMemberToTeamMutation] = useAddMemberToTeamMutation();

  const addMembersToTeam = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async userId => {
          if (!teamId) return;
          const result = await addMemberToTeamMutation({
            variables: { userId, teamId, role: Role.Reader },
            refetchQueries: ["teams"],
          });
          const team = result.data?.addMemberToTeam?.team;
          if (result.errors || !team) {
            setNotification({
              type: "error",
              text: intl.formatMessage({ defaultMessage: "Failed to add one or more members." }),
            });
            return;
          }
          setTeam(team);
        }),
      );
      if (results) {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Successfully added member(s) to the workspace!",
          }),
        });
      }
    },
    [teamId, addMemberToTeamMutation, setTeam, setNotification, intl],
  );

  const [updateMemberOfTeamMutation] = useUpdateMemberOfTeamMutation();

  const updateMemberOfTeam = useCallback(
    async (userId: string, role: RoleUnion) => {
      if (teamId) {
        const results = await updateMemberOfTeamMutation({
          variables: {
            teamId,
            userId,
            role: {
              READER: Role.Reader,
              WRITER: Role.Writer,
              OWNER: Role.Owner,
            }[role],
          },
        });
        const team = results.data?.updateMemberOfTeam?.team;
        if (team) {
          setTeam(team);
        }
      }
    },
    [teamId, setTeam, updateMemberOfTeamMutation],
  );

  const [removeMemberFromTeamMutation] = useRemoveMemberFromTeamMutation();

  const removeMemberFromTeam = useCallback(
    async (userId: string) => {
      if (!teamId) return;
      const result = await removeMemberFromTeamMutation({
        variables: { teamId, userId },
        refetchQueries: ["teams"],
      });
      const team = result.data?.removeMemberFromTeam?.team;
      if (result.errors || !team) {
        setNotification({
          type: "error",
          text: intl.formatMessage({
            defaultMessage: "Failed to delete member from the workspace.",
          }),
        });
        return;
      }
      setTeam(team);
      setNotification({
        type: "success",
        text: intl.formatMessage({
          defaultMessage: "Successfully removed member from the workspace.",
        }),
      });
    },
    [teamId, removeMemberFromTeamMutation, setTeam, intl, setNotification],
  );

  const selectWorkspace = useCallback(
    (team: Team) => {
      if (team.id) {
        setTeam(team);
        navigate(`/settings/workspace/${team.id}`);
      }
    },
    [navigate, setTeam],
  );

  return {
    me,
    teams,
    currentTeam,
    currentProject,
    searchedUser,
    changeSearchedUser,
    createTeam,
    updateName,
    deleteTeam,
    searchUser,
    addMembersToTeam,
    updateMemberOfTeam,
    removeMemberFromTeam,
    selectWorkspace,
    openModal,
    modalShown,
    handleModalClose,
    loading,
  };
};
