import {
  ButtonWrapper,
  InnerPage,
  SettingsWrapper
} from "@reearth/beta/features/ProjectSettings/innerPages/common";
import {
  Collapse,
  Button,
  Modal,
  Typography,
  ModalPanel,
  TextInput,
  IconButton,
  Icon,
  PopupMenu
} from "@reearth/beta/lib/reearth-ui";
import { SelectField } from "@reearth/beta/ui/fields";
import { metricsSizes } from "@reearth/beta/utils/metrics";
import { Role, TeamMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useWorkspace, Workspace } from "@reearth/services/state";
import { styled, useTheme, keyframes } from "@reearth/services/theme";
import { FC, KeyboardEvent, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";

import { WorkspacePayload } from "../../hooks";

type Props = {
  handleAddMemberToWorkspace: ({
    teamId,
    userId,
    role
  }: WorkspacePayload) => Promise<{ status: string }>;
  handleSearchUser: (nameOrEmail: string) =>
    | {
        searchUser: {
          __typename?: "User";
          id: string;
          name: string;
          email: string;
        } | null;
        searchUserStatus: string;
        error?: undefined;
      }
    | {
        error: unknown;
        searchUser?: undefined;
        searchUserStatus?: undefined;
      };
  handleUpdateMemberOfWorkspace: ({
    teamId,
    userId,
    role
  }: WorkspacePayload) => Promise<{ status: string }>;
  handleRemoveMemberFromWorkspace: ({
    teamId,
    userId
  }: WorkspacePayload) => Promise<{ status: string }>;
};

type MemberSearchResult = {
  userName: string;
  email: string;
  id: string;
};

const Members: FC<Props> = ({
  handleSearchUser,
  handleAddMemberToWorkspace,
  handleUpdateMemberOfWorkspace,
  handleRemoveMemberFromWorkspace
}) => {
  const theme = useTheme();
  const t = useT();
  const roles = [
    { value: "READER", label: t("Reader") },
    { value: "WRITER", label: t("Writer") },
    { value: "MAINTAINER", label: t("Maintainer") },
    { value: "OWNER", label: t("Owner") }
  ];

  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  const [memberSearchInput, setMemberSearchInput] = useState<string>("");
  const [debouncedInput, setDebouncedInput] =
    useState<string>(memberSearchInput);
  const [memberSearchResults, setMemberSearchResults] = useState<
    MemberSearchResult[]
  >([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(memberSearchInput.trim());
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [memberSearchInput]);

  const { searchUser, searchUserStatus } = handleSearchUser(debouncedInput);

  useEffect(() => {
    if (
      searchUser &&
      "name" in searchUser &&
      !memberSearchResults.find(
        (memberSearchResult) => memberSearchResult.id === searchUser.id
      )
    ) {
      setMemberSearchResults([
        ...memberSearchResults,
        {
          userName: searchUser.name,
          email: searchUser.email,
          id: searchUser.id
        }
      ]);
    }
  }, [memberSearchResults, searchUser]);

  const handleNewMemberClick = () => {
    setAddMemberModal(true);
  };

  const handleCloseAddMemberModal = () => {
    setAddMemberModal(false);
  };

  const handleChangeRoleButtonClick = (index: number) => {
    setActiveEditIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleChangeRole = async (
    data: TeamMember,
    index: number,
    roleValue: string | string[]
  ) => {
    if (currentWorkspace?.id) {
      const { status } = await handleUpdateMemberOfWorkspace({
        teamId: currentWorkspace?.id,
        userId: data.userId,
        role: roleValue as Role
      });
      if (status === "success") {
        setCurrentWorkspace((prevMembers) => {
          return {
            ...prevMembers,
            members: prevMembers?.members?.map((workspaceMember) =>
              workspaceMember.userId === data.userId
                ? {
                    ...workspaceMember,
                    role: roleValue as Role
                  }
                : workspaceMember
            )
          } as Workspace;
        });
      }
      setActiveEditIndex((prevIndex) => (prevIndex === index ? null : index));
    }
  };

  const handleRemoveMemberButtonClick = async (userId: string) => {
    if (currentWorkspace?.id) {
      const { status } = await handleRemoveMemberFromWorkspace({
        teamId: currentWorkspace?.id,
        userId
      });
      if (status === "success") {
        setCurrentWorkspace((prevMembers) => {
          return {
            ...prevMembers,
            members: prevMembers?.members?.filter(
              (workspaceMember) => workspaceMember.userId !== userId
            )
          } as Workspace;
        });
      }
    }
  };

  const handleAddMember = () => {
    memberSearchResults.forEach(async (memberSearchResult) => {
      if (currentWorkspace?.id) {
        const { status } = await handleAddMemberToWorkspace({
          name: memberSearchResult.userName,
          teamId: currentWorkspace?.id,
          userId: memberSearchResult.id,
          role: Role.Reader
        });

        if (status === "success") {
          setCurrentWorkspace((prevMembers) => {
            return {
              ...prevMembers,
              members: [
                ...(prevMembers?.members || []),
                {
                  __typename: "TeamMember",
                  user: {
                    email: memberSearchResult.email,
                    id: memberSearchResult.id,
                    name: memberSearchResult.userName,
                    __typename: "User"
                  },
                  userId: memberSearchResult.id,
                  role: Role.Reader
                }
              ]
            } as Workspace;
          });
        }
        setAddMemberModal(false);
        setMemberSearchInput("");
        setDebouncedInput("");
        setMemberSearchResults([]);
      }
    });
  };

  const handleDeleteUserForSearchResult = (
    memberSearchResult: MemberSearchResult
  ) => {
    setMemberSearchInput("");
    setDebouncedInput("");
    setMemberSearchResults(
      memberSearchResults.filter(
        (element) => element.id !== memberSearchResult.id
      )
    );
  };

  const handleUserSearchInputOnKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && memberSearchInput.trim() !== "") {
      setMemberSearchInput("");
      setDebouncedInput(memberSearchInput.trim());
    }
  };

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse title={t("Members")} size="large">
          <SettingsFields>
            <ButtonWrapper>
              <Button
                title={t("New member")}
                appearance="primary"
                disabled={currentWorkspace?.personal}
                onClick={handleNewMemberClick}
                icon="memberAdd"
              />
            </ButtonWrapper>
            <Table>
              <TableHeader>{t("User Name")}</TableHeader>
              <TableHeader>{t("Email")}</TableHeader>
              <TableHeader>{t("Role")}</TableHeader>
              <TableHeader />

              {currentWorkspace?.members?.map((data, index) => (
                <Fragment key={index}>
                  <TableRow>{data.user?.name}</TableRow>
                  <TableRow>{data.user?.email}</TableRow>
                  {activeEditIndex !== index ? (
                    <TableRow>{data.role}</TableRow>
                  ) : (
                    <TableRow>
                      <SelectField
                        value={data.role}
                        options={roles}
                        onChange={async (roleValue) => {
                          await handleChangeRole(data, index, roleValue);
                        }}
                      />
                    </TableRow>
                  )}
                  <TableRow>
                    <PopupMenu
                      label={
                        <Button
                          icon="dotsThreeVertical"
                          iconButton
                          appearance="simple"
                        />
                      }
                      menu={[
                        {
                          icon: "arrowLeftRight",
                          id: "changeRole",
                          title: t("Change Role"),
                          disabled: data.role === "OWNER",
                          onClick: () => handleChangeRoleButtonClick(index)
                        },
                        {
                          icon: "close",
                          id: "remove",
                          title: t("Remove"),
                          disabled: data.role === "OWNER",
                          onClick: () =>
                            handleRemoveMemberButtonClick(data.userId)
                        }
                      ]}
                    />
                  </TableRow>
                </Fragment>
              ))}
            </Table>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <Modal visible={!!addMemberModal} size="small">
        <ModalPanel
          title={t("Add a team member")}
          onCancel={handleCloseAddMemberModal}
          actions={[
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={handleCloseAddMemberModal}
            />,
            <Button
              key="add"
              title={t("Add")}
              appearance="primary"
              disabled={
                currentWorkspace?.members?.some((member) =>
                  memberSearchResults.find(
                    (memberSearchResult) =>
                      memberSearchResult.email === member.user?.email
                  )
                ) || memberSearchResults.length === 0
              }
              onClick={handleAddMember}
            />
          ]}
        >
          <ModalContentWrapper>
            <Typography size="body">
              {t("Email address or a user name")}
            </Typography>
            <TextInput
              placeholder="name@reearth.io"
              value={memberSearchInput}
              onChange={(input) => {
                setMemberSearchInput(input);
              }}
              onKeyDown={handleUserSearchInputOnKeyDown}
            />

            {debouncedInput && !searchUser && searchUserStatus !== "loading" ? (
              <SearchMemberMessage
                size="body"
                weight="regular"
                color={theme.warning.main}
              >
                <Icon icon="warning" size="large" color={theme.warning.main} />
                {t("Didn’t find the user")}
              </SearchMemberMessage>
            ) : undefined}

            {memberSearchResults &&
              memberSearchResults.map((memberSearchResult) => (
                <ItemContainer key={memberSearchResult.id}>
                  <UserInfo>
                    <span>{memberSearchResult.userName}</span>
                    <span style={{ color: theme.content.weak }}>
                      {memberSearchResult.email}
                    </span>
                  </UserInfo>
                  <DeleteIcon
                    icon="trash"
                    size="normal"
                    hasBorder={false}
                    appearance="simple"
                    onClick={() => {
                      handleDeleteUserForSearchResult(memberSearchResult);
                    }}
                  />
                </ItemContainer>
              ))}
          </ModalContentWrapper>
        </ModalPanel>
      </Modal>
    </InnerPage>
  );
};

const zoomIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: theme.spacing.largest
}));

const Table = styled.div`
  display: grid;
  grid-template-columns: 5fr 2.5fr 2fr 1fr;
  gap: 16px;
  padding: 10px;
  color: ${({ theme }) => theme.content.main};
`;

const TableHeader = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  color: theme.content.weak,
  lineHeight: "28px",
  display: "flex",
  alignItems: "center"
}));

const TableRow = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  lineHeight: "28px",
  display: "flex",
  alignItems: "center",
  animation: `${zoomIn} 0.2s ease-in-out`
}));

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1],
  borderRadius: theme.radius.large
}));

const ItemContainer = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0px 12px",
  fontSize: theme.fonts.sizes.body
}));

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${zoomIn} 0.2s ease-in-out;
`;

const DeleteIcon = styled(IconButton)(({ theme }) => ({
  cursor: "pointer",
  color: theme.content.main,
  "&:hover": {
    color: theme.dangerous.main
  }
}));

const SearchMemberMessage = styled(Typography)`
  margin-top: ${metricsSizes["2xs"]}px;
  display: flex;
`;

export default Members;
