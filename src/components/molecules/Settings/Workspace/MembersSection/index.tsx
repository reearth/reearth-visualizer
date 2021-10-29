import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Section from "@reearth/components/molecules/Settings/Section";
import AddMemberModal from "@reearth/components/molecules/Settings/Workspace/AddMemberModal";
import MemberList from "@reearth/components/molecules/Settings/Workspace/MemberList";
import MemberListItem, {
  Role,
} from "@reearth/components/molecules/Settings/Workspace/MemberListItem";
import { styled } from "@reearth/theme";

type Me = {
  id?: string;
};

type TeamMember = {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  userId: string;
  role: Role;
};

type Props = {
  me?: Me;
  owner?: boolean;
  members?: TeamMember[];
  searchedUser?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  personal?: boolean;
  searchUser: (nameOrEmail: string) => void;
  changeSearchedUser: (
    user: { userId: string; userName: string; userEmail: string } | undefined,
  ) => void;
  addMembersToTeam: (userIds: string[]) => Promise<void>;
  updateMemberOfTeam: (userId: string, role: Role) => void;
  removeMemberFromTeam: (userId: string) => void;
};

const MembersSection: React.FC<Props> = ({
  me,
  owner,
  members = [],
  searchedUser,
  personal,
  searchUser,
  changeSearchedUser,
  addMembersToTeam,
  updateMemberOfTeam,
  removeMemberFromTeam,
}) => {
  const intl = useIntl();

  const [isAdding, setIsAdding] = useState(false);

  const startAdd = useCallback(() => setIsAdding(true), [setIsAdding]);
  const stopAdd = useCallback(() => setIsAdding(false), [setIsAdding]);

  return (
    <Wrapper>
      <Section
        title={intl.formatMessage({ defaultMessage: "Members" })}
        actions={
          !personal &&
          owner === true && (
            <Button
              large
              text={intl.formatMessage({ defaultMessage: "New member" })}
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
                name={user.name ?? user.email}
                role={role}
                owner={owner}
                isMyself={me?.id === user.id}
                onChangeRole={role => updateMemberOfTeam(user.id, role)}
                onRemove={() => removeMemberFromTeam(user.id)}
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
            addMembersToTeam={addMembersToTeam}
          />
        )}
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.main.lighterBg};
  width: 100%;
`;

export default MembersSection;
