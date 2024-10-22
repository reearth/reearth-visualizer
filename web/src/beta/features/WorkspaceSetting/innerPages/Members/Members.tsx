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
  IconButton
} from "@reearth/beta/lib/reearth-ui";
import { SelectField } from "@reearth/beta/ui/fields";
import { Role } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
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
        __typename?: "User";
        id: string;
        name: string;
        email: string;
      }
    | {
        error: unknown;
      }
    | null;
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
  const data = currentWorkspace?.members?.map((member) => {
    return {
      username: member.user.name,
      email: member.user.email,
      role: member.role,
      id: member.user.id
    };
  });

  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);
  const [activePopupIndex, setActivePopupIndex] = useState<number | null>(null);

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

  const searchUser = handleSearchUser(debouncedInput);

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

              {data?.map((user, index) => (
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
                          }
                        }}
                      />
                    </TableRow>
                  )}
                  <IconCell>
                    <IconButton
                      icon="dotsThreeVertical"
                      disabled={user.role === "OWNER"}
                      size="large"
                      hasBorder={false}
                      appearance="simple"
                      onClick={() =>
                        setActivePopupIndex((prevIndex) =>
                          prevIndex === index ? null : index
                        )
                      }
                    />
                    {activePopupIndex === index && (
                      <PopupMenu>
                        <div>
                          <IconButton
                            icon="editMode"
                            appearance="simple"
                            onClick={() => {
                              setActivePopupIndex(null);
                              setActiveEditIndex((prevIndex) =>
                                prevIndex === index ? null : index
                              );
                            }}
                          />
                          <Typography size="body">{t("edit")}</Typography>
                        </div>
                        <div>
                          <IconButton
                            icon="trash"
                            appearance="simple"
                            onClick={() => {
                              setActivePopupIndex(null);
                              if (currentWorkspace?.id) {
                                handleRemoveMemberFromWorkspace({
                                  teamId: currentWorkspace?.id,
                                  userId: user.id
                                });
                              }
                            }}
                          />
                          <Typography size="body">{t("trash")}</Typography>
                        </div>
                      </PopupMenu>
                    )}
                  </IconCell>
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
                data?.some(
                  //existed user || no searchResult
                  (member) =>
                    memberSearchResults.find(
                      (memberSearchResult) =>
                        memberSearchResult.email === member.email
                    )
                ) || memberSearchResults.length === 0
              }
              onClick={() => {
                memberSearchResults.map((memberSearchResult) => {
                  if (currentWorkspace?.id) {
                    handleAddMemberToWorkspace({
                      name: memberSearchResult.userName,
                      teamId: currentWorkspace?.id,
                      userId: memberSearchResult.id,
                      role: Role.Reader
                    });
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
  alignItems: "center"
}));

const IconCell = styled("div")(() => ({
  lineHeight: "28px",
  display: "flex",
  alignItems: "center",
  position: "relative"
}));

const PopupMenu = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  boxShadow: `${theme.shadow.popup}`,
  position: "absolute",
  top: "1rem",
  left: "1.2rem",
  zIndex: 100,
  "& > div": {
    display: "flex",
    gap: "0.5rem",
    padding: "2px 6px",
    alignItems: "center",
    "&:hover": {
      backgroundColor: theme.bg[2],
      cursor: "pointer"
    }
  },
  "& > div:not(:last-child)": {
    borderBottom: `solid 1px ${theme.outline.weak}`
  }
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
`;

const DeleteIcon = styled(IconButton)(() => ({
  cursor: "pointer",
  color: "#fff",
  "&:hover": {
    color: "red"
  }
}));

export default Members;
