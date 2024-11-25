import {
  ButtonWrapper,
  InnerPage,
  SettingsWrapper
} from "@reearth/beta/features/ProjectSettings/innerPages/common";
import { Button, Collapse, PopupMenu } from "@reearth/beta/lib/reearth-ui";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { TeamMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, Fragment, useCallback, useMemo, useState } from "react";

import AddMemberModal from "./AddMemberModal";
import UpdateRoleModal from "./UpdateRoleModal";

const rolePriority = {
  OWNER: 1,
  MAINTAINER: 2,
  WRITER: 3,
  READER: 4
};

type MembersProps = {
  workspace: Workspace | undefined;
};

const Members: FC<MembersProps> = ({ workspace }) => {
  const t = useT();

  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [updateRoleModalVisible, setUpdateRoleModalVisible] = useState(false);
  const [updatingRoleMember, setUpdatingRoleMember] = useState<TeamMember>();

  const handleClickNewMember = useCallback(() => {
    setAddMemberModalVisible(true);
  }, []);

  const { useRemoveMemberFromWorkspace: removeMember } = useWorkspaceFetcher();

  const handleRemoveMember = useCallback(
    (userId: string) => {
      if (!userId || !workspace?.id) return;
      removeMember({ teamId: workspace.id, userId });
    },
    [workspace, removeMember]
  );

  const handleUpdateRole = useCallback((member: TeamMember) => {
    setUpdatingRoleMember(member);
    setUpdateRoleModalVisible(true);
  }, []);

  const sortedMembers = useMemo(
    () =>
      [...(workspace?.members ?? [])].sort((a, b) => {
        const compare = rolePriority[a.role] - rolePriority[b.role];
        if (compare === 0) {
          return (a.user?.name ?? "").localeCompare(b.user?.name ?? "");
        }
        return compare;
      }) ?? [],
    [workspace?.members]
  );

  const memerRoleTranslation = {
    MAINTAINER: t("MAINTAINER"),
    OWNER: t("OWNER"),
    READER: t("READER"),
    WRITER: t("WRITER")
  };

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse title={t("Members")} size="large">
          <ContentWrapper>
            {!workspace?.personal && (
              <ButtonWrapper>
                <Button
                  title={t("New member")}
                  appearance="primary"
                  onClick={handleClickNewMember}
                  icon="memberAdd"
                />
              </ButtonWrapper>
            )}
            <Table>
              <TableHeaderCell>{t("User Name")}</TableHeaderCell>
              <TableHeaderCell>{t("Email")}</TableHeaderCell>
              <TableHeaderCell>{t("Role")}</TableHeaderCell>
              <TableHeaderCell />
              {sortedMembers.map((member, index) => (
                <Fragment key={index}>
                  <TableCell>{member.user?.name}</TableCell>
                  <TableCell>{member.user?.email}</TableCell>
                  <TableCell>{memerRoleTranslation[member.role]}</TableCell>
                  <TableCell justifyContent="flex-end">
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
                          disabled: member.role === "OWNER",
                          onClick: () => handleUpdateRole(member)
                        },
                        {
                          icon: "close",
                          id: "remove",
                          title: t("Remove"),
                          disabled: member.role === "OWNER",
                          onClick: () => handleRemoveMember(member.userId)
                        }
                      ]}
                    />
                  </TableCell>
                </Fragment>
              ))}
            </Table>
          </ContentWrapper>
        </Collapse>
      </SettingsWrapper>
      {addMemberModalVisible && (
        <AddMemberModal
          workspace={workspace}
          visible
          onClose={() => setAddMemberModalVisible(false)}
        />
      )}
      {updateRoleModalVisible && updatingRoleMember && (
        <UpdateRoleModal
          workspace={workspace}
          member={updatingRoleMember}
          visible
          onClose={() => setUpdateRoleModalVisible(false)}
        />
      )}
    </InnerPage>
  );
};

export default Members;

const ContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  gap: theme.spacing.largest
}));

const Table = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "3fr 4fr 2fr 1fr",
  gap: "16px",
  padding: "10px",
  color: theme.content.main
}));

const TableHeaderCell = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  color: theme.content.weak,
  lineHeight: "28px",
  display: "flex",
  alignItems: "center"
}));

const TableCell = styled("div")<{ justifyContent?: string }>(
  ({ theme, justifyContent = "flex-start" }) => ({
    color: theme.content.main,
    fontSize: theme.fonts.sizes.body,
    lineHeight: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent
  })
);
