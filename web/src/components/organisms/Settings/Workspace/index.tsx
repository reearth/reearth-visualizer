import React, { useCallback, useEffect, useState } from "react";

import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import DangerSection from "@reearth/components/molecules/Settings/Workspace/DangerSection";
import MembersSection from "@reearth/components/molecules/Settings/Workspace/MembersSection";
import ProfileSection from "@reearth/components/molecules/Settings/Workspace/ProfileSection";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

type Props = {
  workspaceId: string;
};

const WorkspaceSettings: React.FC<Props> = ({ workspaceId }) => {
  const {
    me,
    currentWorkspace,
    currentProject,
    searchedUser,
    changeSearchedUser,
    deleteWorkspace,
    updateName,
    searchUser,
    addMembersToWorkspace,
    updateMemberOfWorkspace,
    removeMemberFromWorkspace,
  } = useHooks({ workspaceId });
  const [owner, setOwner] = useState(false);
  const members = currentWorkspace?.members;

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
    <SettingPage workspaceId={workspaceId} projectId={currentProject?.id}>
      <SettingsHeader currentWorkspace={currentWorkspace} />
      <ProfileSection
        currentWorkspace={currentWorkspace}
        updateWorkspaceName={updateName}
        owner={owner}
      />
      {!currentWorkspace?.personal && (
        <MembersSection
          me={me}
          owner={owner}
          members={members}
          searchedUser={searchedUser}
          changeSearchedUser={changeSearchedUser}
          searchUser={searchUser}
          addMembersToWorkspace={addMembersToWorkspace}
          updateMemberOfWorkspace={updateMemberOfWorkspace}
          removeMemberFromWorkspace={removeMemberFromWorkspace}
        />
      )}
      {me.myTeam !== workspaceId && (
        <DangerSection workspace={currentWorkspace} deleteWorkspace={deleteWorkspace} />
      )}
    </SettingPage>
  );
};

export default WorkspaceSettings;
