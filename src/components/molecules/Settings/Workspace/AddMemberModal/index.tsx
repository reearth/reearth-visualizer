import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  active: boolean;
  close: () => void;
  searchedUser?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  searchUser: (nameOrEmail: string) => void;
  changeSearchedUser: (
    user: { userId: string; userName: string; userEmail: string } | undefined,
  ) => void;
  addMembersToTeam?: (userIds: string[]) => Promise<void>;
};

const AddMemberModal: React.FC<Props> = ({
  active,
  close,
  searchedUser,
  searchUser,
  changeSearchedUser,
  addMembersToTeam,
}) => {
  const intl = useIntl();
  const theme = useTheme();

  const [users, setUsers] = useState<{ userId: string; userName: string; userEmail: string }[]>([]);
  const [nameOrEmail, setNameOrEmail] = useState("");

  const handleChange = useCallback(
    (nameOrEmail: string | undefined) => {
      searchUser(nameOrEmail ?? "");
      setNameOrEmail(nameOrEmail ?? "");
    },
    [searchUser, setNameOrEmail],
  );

  useEffect(() => {
    if (searchedUser && !users.find(user => user.userId === searchedUser.userId)) {
      setUsers([...users, searchedUser]);
      setNameOrEmail("");
      searchUser("");
    }
  }, [searchedUser, setUsers, users, searchUser]);

  const removeUser = useCallback(
    (userId: string) => {
      changeSearchedUser(undefined);
      setUsers(users => users.filter(user => user.userId !== userId));
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
    await addMembersToTeam?.(users.map(({ userId }) => userId));
    changeSearchedUser(undefined);
    setUsers([]);
    setNameOrEmail("");
    close();
  }, [addMembersToTeam, users, setUsers, setNameOrEmail, changeSearchedUser, close]);

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Add a team member" })}
      size="sm"
      isVisible={active}
      onClose={handleClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Add" })}
          onClick={add}
          disabled={users.length === 0}
        />
      }
      button2={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={handleClose}
        />
      }>
      <StyledTextBox
        value={nameOrEmail}
        placeholder={intl.formatMessage({
          defaultMessage: "Input an email address or a user name",
        })}
        onChange={handleChange}
      />
      <UserList>
        {users.map(({ userId, userName, userEmail }) => (
          <UserListItem key={userId}>
            <UserIdentity>
              <Text size="m">{userName}</Text>
              <Text size="s" color={theme.infoBox.weakText}>
                {userEmail}
              </Text>
            </UserIdentity>
            <RemoveIcon icon="cancel" onClick={() => removeUser(userId)} />
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
