import React, { useCallback, useEffect, useState } from "react";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import DangerSection from "@reearth/components/molecules/Settings/Workspace/DangerSection";
import MembersSection from "@reearth/components/molecules/Settings/Workspace/MembersSection";
import ProfileSection from "@reearth/components/molecules/Settings/Workspace/ProfileSection";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  teamId: string;
};

const WorkspaceSettings: React.FC<Props> = ({ teamId }) => {
  const {
    me,
    currentTeam,
    currentProject,
    searchedUser,
    changeSearchedUser,
    deleteTeam,
    updateName,
    searchUser,
    addMembersToTeam,
    updateMemberOfTeam,
    removeMemberFromTeam,
  } = useHooks({ teamId });
  const [owner, setOwner] = useState(false);
  const members = currentTeam?.members;

  const checkOwner = useCallback(() => {
    if (members) {
      for (let i = 0; i < members.length; i++) {
        if (members[i].userId === me?.id && members[i].role === "OWNER") {
          return true;
        }
      }
    }
    return false;
  }, [members, me?.id]);

  useEffect(() => {
    const o = checkOwner();
    setOwner(o);
  }, [checkOwner]);

  return (
    <SettingPage teamId={teamId} projectId={currentProject?.id}>
      <SettingsHeader currentWorkspace={currentTeam} />
      <ProfileSection currentTeam={currentTeam} updateTeamName={updateName} owner={owner} />
      {!currentTeam?.personal && (
        <MembersSection
          me={me}
          owner={owner}
          members={members}
          searchedUser={searchedUser}
          changeSearchedUser={changeSearchedUser}
          searchUser={searchUser}
          addMembersToTeam={addMembersToTeam}
          updateMemberOfTeam={updateMemberOfTeam}
          removeMemberFromTeam={removeMemberFromTeam}
        />
      )}
      {me.myTeam !== teamId && <DangerSection team={currentTeam} deleteTeam={deleteTeam} />}
    </SettingPage>
  );
};

export default WorkspaceSettings;
