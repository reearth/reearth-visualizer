import { useNavigate } from "@reach/router";
import { useCallback, useEffect, useState } from "react";

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
import { useTeam, useProject } from "@reearth/state";

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const [currentTeam, setTeam] = useTeam();
  const [currentProject] = useProject();

  const navigate = useNavigate();
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
  const searchedUser = searchUserData?.searchUser ?? undefined;

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
      if (results) {
        setTeam(team);
      }
      setModalShown(false);
    },
    [createTeamMutation, setTeam],
  );

  const [updateTeamMutation] = useUpdateTeamMutation();

  const updateName = useCallback(
    (name: string) => teamId && updateTeamMutation({ variables: { teamId, name } }),
    [teamId, updateTeamMutation],
  );

  const [deleteTeamMutation] = useDeleteTeamMutation({
    refetchQueries: ["teams"],
  });
  const deleteTeam = useCallback(async () => {
    if (teamId) {
      await deleteTeamMutation({ variables: { teamId } });
    }
    setTeam(teams[0]);
  }, [teamId, setTeam, teams, deleteTeamMutation]);

  const [addMemberToTeamMutation] = useAddMemberToTeamMutation();

  const addMembersToTeam = useCallback(
    async (userIds: string[]) => {
      await Promise.all(
        userIds.map(async userId => {
          if (teamId) {
            await addMemberToTeamMutation({ variables: { userId, teamId, role: Role.Reader } });
          }
        }),
      );
    },
    [teamId, addMemberToTeamMutation],
  );

  const [updateMemberOfTeamMutation] = useUpdateMemberOfTeamMutation();

  const updateMemberOfTeam = useCallback(
    (userId: string, role: RoleUnion) => {
      if (teamId) {
        updateMemberOfTeamMutation({
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
      }
    },
    [teamId, updateMemberOfTeamMutation],
  );

  const [removeMemberFromTeamMutation] = useRemoveMemberFromTeamMutation();

  const removeMemberFromTeam = useCallback(
    (userId: string) => {
      if (teamId) {
        removeMemberFromTeamMutation({ variables: { teamId, userId } });
      }
    },
    [teamId, removeMemberFromTeamMutation],
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
