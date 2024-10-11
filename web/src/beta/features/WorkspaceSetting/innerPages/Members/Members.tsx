import {
  ButtonWrapper,
  InnerPage,
  SettingsWrapper
} from "@reearth/beta/features/ProjectSettings/innerPages/common";
import {
  Collapse,
  Button,
  Icon,
  Modal,
  Typography,
  ModalPanel,
  TextInput
} from "@reearth/beta/lib/reearth-ui";
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
  debounceOnUpdate: (nameOrEmail: string) => any;
};

const Members: FC<Props> = ({
  debounceOnUpdate,
  handleAddMemberToWorkspace
}) => {
  const t = useT();
  const theme = useTheme();
  const [currentWorkspace] = useWorkspace();
  const [addMemberModal, setAddMemberModal] = useState<boolean>(false);
  const [memberSearchInput, setMemberSearchInput] = useState<string>("");
  const [memberSearchResult, setMemberSearchResult] = useState<{
    userName: string;
    email: string;
  }>({ userName: "name", email: "email" });

  const data = currentWorkspace?.members?.map((member) => {
    return {
      username: member.user.name,
      email: member.user.email,
      role: member.role
    };
  });

  //useQuery是hooks，无法在回调函数中使用，怎么办(setState inbounce测试以下)
  // const searchUser = debounceOnUpdate(memberSearchInput);
  // useEffect(() => {
  //   console.log(searchUser);
  // }, [searchUser, searchUser?.email, searchUser?.id, searchUser?.name]);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse title={t("Members")} size="large">
          <SettingsFields>
            <ButtonWrapper>
              <Button
                title={t("New member")}
                appearance="primary"
                onClick={() => {
                  setAddMemberModal(true);
                }}
                icon={"user"}
              />
            </ButtonWrapper>
            <Table>
              <TableHeader>User Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader />

              {data?.map((user, index) => (
                <Fragment key={index}>
                  <TableRow>{user.username}</TableRow>
                  <TableRow>{user.email}</TableRow>
                  <TableRow>{user.role}</TableRow>
                  <IconCell>
                    <Icon icon="dotsThreeVertical" size="large" />
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
              onClick={() => {
                //TODO
                handleAddMemberToWorkspace({
                  teamId: currentWorkspace?.id,
                  userId: "",
                  role: Role.Reader
                });
              }}
            />
          ]}
        >
          <ModalContentWrapper>
            <Typography size="body">Email address or a user name</Typography>
            <TextInput
              placeholder="name@reearth.io"
              value={memberSearchInput}
              onChange={(input) => {
                setMemberSearchInput(input);
              }}
            />
            <ItemContainer
              onClick={() => {
                const { userName, email } = memberSearchResult;
                setMemberSearchInput(email);
                setMemberSearchResult({
                  userName,
                  email
                });
              }}
            >
              <UserInfo>
                <span>{memberSearchResult.userName}</span>
                <span style={{ color: theme.content.weak }}>
                  {memberSearchResult.email}
                </span>
              </UserInfo>
              <DeleteIcon icon="trash" size="normal" />
            </ItemContainer>
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
  grid-template-columns: 5fr 2.5fr 2fr 0.5fr;
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
  alignItems: "center"
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
  padding: "12px 12px",
  fontSize: theme.fonts.sizes.body
}));

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DeleteIcon = styled(Icon)(() => ({
  cursor: "pointer",
  color: "#fff",
  "&:hover": {
    color: "red"
  }
}));

export default Members;
