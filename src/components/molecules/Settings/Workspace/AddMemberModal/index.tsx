import React, { useCallback, useState, useEffect } from "react";

import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Props = {
  active: boolean;
  close: () => void;
  searchedUser?: User;
  searchUser: (nameOrEmail: string) => void;
  changeSearchedUser: (user: User | undefined) => void;
  addMembersToWorkspace?: (userIds: string[]) => Promise<void>;
};

const AddMemberModal: React.FC<Props> = ({
  active,
  close,
  searchedUser,
  searchUser,
  changeSearchedUser,
  addMembersToWorkspace,
}) => {
  const t = useT();
  const theme = useTheme();

  const [users, setUsers] = useState<User[]>([]);
  const [nameOrEmail, setNameOrEmail] = useState("");

  const handleChange = useCallback(
    (nameOrEmail: string | undefined) => {
      searchUser(nameOrEmail ?? "");
      setNameOrEmail(nameOrEmail ?? "");
    },
    [searchUser, setNameOrEmail],
  );

  useEffect(() => {
    if (searchedUser && !users.find(user => user.id === searchedUser.id)) {
      setUsers([...users, searchedUser]);
      setNameOrEmail("");
      searchUser("");
    }
  }, [searchedUser, setUsers, users, searchUser]);

  const removeUser = useCallback(
    (userId: string) => {
      changeSearchedUser(undefined);
      setUsers(users => users.filter(user => user.id !== userId));
    },
    [setUsers, changeSearchedUser],
  );

  const handleClose = useCallback(() => {
    changeSearchedUser(undefined);
    setUsers([]);
    setNameOrEmail("");
    close();
  }, [setUsers, setNameOrEmail, changeSearchedUser, close]);

  const add = useCallback(async () => {
    await addMembersToWorkspace?.(users.map(({ id }) => id));
    changeSearchedUser(undefined);
    setUsers([]);
    setNameOrEmail("");
    close();
  }, [addMembersToWorkspace, users, changeSearchedUser, close]);

  return (
    <Modal
      title={t("Add a team member")}
      size="sm"
      isVisible={active}
      onClose={handleClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={t("Add")}
          onClick={add}
          disabled={users.length === 0}
        />
      }
      button2={<Button large buttonType="secondary" text={t("Cancel")} onClick={handleClose} />}>
      <StyledTextBox
        value={nameOrEmail}
        placeholder={t("Input an email address or a user name")}
        onChange={handleChange}
      />
      <UserList>
        {users.map(({ id, name, email }) => (
          <UserListItem key={id}>
            <UserIdentity>
              <Text size="m">{name}</Text>
              <Text size="s" color={theme.infoBox.weakText}>
                {email}
              </Text>
            </UserIdentity>
            <RemoveIcon icon="cancel" onClick={() => removeUser(id)} />
          </UserListItem>
        ))}
      </UserList>
    </Modal>
  );
};

const StyledTextBox = styled(TextBox)`
  margin-top: 40px;
`;

const UserList = styled.ul`
  padding: 0;
  margin: 20px 0;
`;

const UserListItem = styled.li`
  display: flex;
  align-items: center;
  &:not(:first-of-type) {
    margin-top: 8px;
  }
`;

const UserIdentity = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RemoveIcon = styled(Icon)`
  color: ${({ theme }) => theme.main.danger};
  cursor: pointer;
`;

export default AddMemberModal;
