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
import { Role } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled, useTheme, keyframes } from "@reearth/services/theme";
import { FC, useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";

import { WorkspacePayload } from "../../hooks";

type Props = {
  handleAddMemberToWorkspace: ({
    teamId,
    userId,
    role
  }: WorkspacePayload) => Promise<void>;
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
  }: WorkspacePayload) => Promise<void>;
  handleRemoveMemberFromWorkspace: ({
    teamId,
    userId
  }: WorkspacePayload) => Promise<void>;
};

type MembersData = {
  id: string;
  role: Role;
  username?: string;
  email?: string;
}[];

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

  const [currentWorkspace] = useWorkspace();
  const [workspaceMembers, setWorkspaceMembers] = useState<MembersData>([]);

  useEffect(() => {
    setWorkspaceMembers(
      currentWorkspace?.members
        ?.filter((m) => !!m.user)
        .map((member) => ({
          id: member.userId,
          role: member.role,
          username: member.user?.name,
          email: member.user?.email
        })) ?? []
    );
  }, [currentWorkspace]);

  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  const [memberSearchInput, setMemberSearchInput] = useState<string>("");
  const [debouncedInput, setDebouncedInput] =
    useState<string>(memberSearchInput);
  const [memberSearchResults, setMemberSearchResults] = useState<
    {
      userName: string;
      email: string;
      id: string;
    }[]
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
                onClick={() => {
                  setAddMemberModal(true);
                }}
                icon="memberAdd"
              />
            </ButtonWrapper>
            <Table>
              <TableHeader>{t("User Name")}</TableHeader>
              <TableHeader>{t("Email")}</TableHeader>
              <TableHeader>{t("Role")}</TableHeader>
              <TableHeader />

              {workspaceMembers?.map((user, index) => (
                <Fragment key={index}>
                  <TableRow>{user.username}</TableRow>
                  <TableRow>{user.email}</TableRow>
                  {activeEditIndex !== index ? (
                    <TableRow>{user.role}</TableRow>
                  ) : (
                    <TableRow>
                      <SelectField
                        value={user.role}
                        options={roles}
                        onChange={(roleValue) => {
                          if (currentWorkspace?.id) {
                            handleUpdateMemberOfWorkspace({
                              teamId: currentWorkspace?.id,
                              userId: user.id,
                              role: roleValue as Role
                            });
                            setWorkspaceMembers((prevMembers) => {
                              return prevMembers.map((workspaceMember) =>
                                workspaceMember.id === user.id
                                  ? {
                                      ...workspaceMember,
                                      role: roleValue as Role
                                    }
                                  : workspaceMember
                              );
                            });
                            setActiveEditIndex((prevIndex) =>
                              prevIndex === index ? null : index
                            );
                          }
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
                          disabled: user.role === "OWNER",
                          onClick: () => {
                            setActiveEditIndex((prevIndex) =>
                              prevIndex === index ? null : index
                            );
                          }
                        },
                        {
                          icon: "close",
                          id: "remove",
                          title: t("Remove"),
                          disabled: user.role === "OWNER",
                          onClick: () => {
                            if (currentWorkspace?.id) {
                              handleRemoveMemberFromWorkspace({
                                teamId: currentWorkspace?.id,
                                userId: user.id
                              });
                            }
                            setWorkspaceMembers(
                              workspaceMembers.filter(
                                (workspaceMember) =>
                                  workspaceMember.id !== user.id
                              )
                            );
                          }
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
          onCancel={() => {
            setAddMemberModal(false);
          }}
          actions={[
            <Button
              key="cancel"
              title={t("Cancel")}
              appearance="secondary"
              onClick={() => {
                setAddMemberModal(false);
              }}
            />,
            <Button
              key="add"
              title={t("Add")}
              appearance="primary"
              disabled={
                workspaceMembers?.some(
                  //existed user || no searchResult
                  (member) =>
                    memberSearchResults.find(
                      (memberSearchResult) =>
                        memberSearchResult.email === member.email
                    )
                ) || memberSearchResults.length === 0
              }
              onClick={() => {
                memberSearchResults.forEach((memberSearchResult) => {
                  if (currentWorkspace?.id) {
                    handleAddMemberToWorkspace({
                      name: memberSearchResult.userName,
                      teamId: currentWorkspace?.id,
                      userId: memberSearchResult.id,
                      role: Role.Reader
                    });
                    setWorkspaceMembers((prevMembers) => [
                      ...prevMembers,
                      {
                        username: memberSearchResult.userName,
                        email: memberSearchResult.email,
                        role: Role.Reader,
                        id: memberSearchResult.id
                      }
                    ]);
                    setAddMemberModal(false);
                    setMemberSearchInput("");
                    setDebouncedInput("");
                    setMemberSearchResults([]);
                  }
                });
              }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && memberSearchInput.trim() !== "") {
                  setMemberSearchInput("");
                  setDebouncedInput(memberSearchInput.trim());
                }
              }}
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
                      setMemberSearchInput("");
                      setDebouncedInput("");
                      setMemberSearchResults(
                        memberSearchResults.filter(
                          (element) => element.id !== memberSearchResult.id
                        )
                      );
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
  color: white;
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

const DeleteIcon = styled(IconButton)(() => ({
  cursor: "pointer",
  color: "#fff",
  "&:hover": {
    color: "red"
  }
}));

const SearchMemberMessage = styled(Typography)`
  margin-top: ${metricsSizes["2xs"]}px;
  display: flex;
`;

export default Members;
