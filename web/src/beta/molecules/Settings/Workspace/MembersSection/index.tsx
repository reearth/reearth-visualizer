import React, { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Section from "@reearth/beta/molecules/Settings/Section";
import AddMemberModal, {
  User as UserType,
} from "@reearth/beta/molecules/Settings/Workspace/AddMemberModal";
import MemberList from "@reearth/beta/molecules/Settings/Workspace/MemberList";
import MemberListItem, { Role } from "@reearth/beta/molecules/Settings/Workspace/MemberListItem";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type Me = {
  id?: string;
};

export type User = UserType;

type WorkspaceMember = {
  user?: User;
  userId: string;
  role: Role;
};

type Props = {
  me?: Me;
  owner?: boolean;
  members?: WorkspaceMember[];
  searchedUser?: User;
  personal?: boolean;
  searchUser: (nameOrEmail: string) => void;
  changeSearchedUser: (user: User | undefined) => void;
  addMembersToWorkspace: (userIds: string[]) => Promise<void>;
  updateMemberOfWorkspace: (userId: string, role: Role) => void;
  removeMemberFromWorkspace: (userId: string) => void;
};

const MembersSection: React.FC<Props> = ({
  me,
  owner,
  members = [],
  searchedUser,
  personal,
  searchUser,
  changeSearchedUser,
  addMembersToWorkspace,
  updateMemberOfWorkspace,
  removeMemberFromWorkspace,
}) => {
  const t = useT();

  const [isAdding, setIsAdding] = useState(false);

  const startAdd = useCallback(() => setIsAdding(true), [setIsAdding]);
  const stopAdd = useCallback(() => setIsAdding(false), [setIsAdding]);

  return (
    <Wrapper>
      <Section
        title={t("Members")}
        actions={
          !personal &&
          owner === true && (
            <Button
              large
              text={t("New member")}
              onClick={startAdd}
              buttonType="secondary"
              icon="memberAdd"
            />
          )
        }>
        <MemberList>
          {members.map(({ user, role }) =>
            user ? (
              <MemberListItem
                key={user.id}
                user={user}
                role={role}
                owner={owner}
                isMe={me?.id === user.id}
                onChangeRole={role => updateMemberOfWorkspace(user.id, role)}
                onRemove={() => removeMemberFromWorkspace(user.id)}
              />
            ) : null,
          )}
        </MemberList>
        {!personal && (
          <AddMemberModal
            active={isAdding}
            close={stopAdd}
            searchedUser={searchedUser}
            searchUser={searchUser}
            changeSearchedUser={changeSearchedUser}
            addMembersToWorkspace={addMembersToWorkspace}
          />
        )}
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.classic.main.lighterBg};
  width: 100%;
`;

export default MembersSection;
