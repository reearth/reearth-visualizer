import React, { useCallback, useEffect, useState } from "react";
import useHooks from "./hooks";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import MembersSection from "@reearth/components/molecules/Settings/Workspace/MembersSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import ProfileSection from "@reearth/components/molecules/Settings/Workspace/ProfileSection";
import DangerSection from "@reearth/components/molecules/Settings/Workspace/DangerSection";

type Props = {
  teamId: string;
};

const WorkspaceSettings: React.FC<Props> = ({ teamId }) => {
  const {
    me,
    currentTeam,
    currentProject,
    searchedUser,
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
        <>
          <MembersSection
            me={me}
            owner={owner}
            members={members}
            searchedUser={searchedUser}
            searchUser={searchUser}
            addMembersToTeam={addMembersToTeam}
            updateMemberOfTeam={updateMemberOfTeam}
            removeMemberFromTeam={removeMemberFromTeam}
          />
        </>
      )}
      {me.myTeam !== teamId && <DangerSection team={currentTeam} deleteTeam={deleteTeam} />}
    </SettingPage>
  );
};

export default WorkspaceSettings;
