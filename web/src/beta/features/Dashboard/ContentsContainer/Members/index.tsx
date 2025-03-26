import { Button, TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { useMeFetcher, useWorkspaceFetcher } from "@reearth/services/api";
import { config } from "@reearth/services/config";
import { TeamMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useEffect, useMemo, useState } from "react";

import { Workspace } from "../../type";

import AddMemberModal from "./AddMemberModal";
import DeleteMemberWarningModal from "./DeleteMemberWarningModal";
import ListItem from "./ListItem";
import { PermissionService } from "./PermissionService";
import UpdateRoleModal from "./UpdateRoleModal";

const ROLE_PRIORITY = { OWNER: 1, MAINTAINER: 2, WRITER: 3, READER: 4 };

type Props = { currentWorkspace?: Workspace };

const Members: FC<Props> = ({ currentWorkspace }) => {
  const { workspace } = useWorkspaceFetcher().useWorkspaceQuery(
    currentWorkspace?.id
  );
  const { me } = useMeFetcher().useMeQuery();
  const meId = me?.id;
  const meRole = useMemo(
    () => workspace?.members.find((m) => m.userId === meId)?.role,
    [workspace, meId]
  );
  const t = useT();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<
    Workspace["members"] | null
  >(null);

  const [selectedMember, setSelectedMember] = useState<TeamMember>();
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [updateRoleModalVisible, setUpdateRoleModalVisible] = useState(false);
  const [deleteMemerModalVisible, setDeleteMemerModalVisible] = useState(false);

  useEffect(() => {
    setFilteredMembers(workspace?.members || null);
  }, [workspace]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!workspace?.members) return;
    const v = value.toLowerCase();
    const members = value
      ? workspace.members.filter(({ user }) =>
          [user?.name, user?.email].some((str) =>
            str?.toLowerCase().includes(v)
          )
        )
      : workspace.members;
    setFilteredMembers(members);
  };

  const sortedMembers = useMemo(() => {
    if (!filteredMembers) return [];
    return filteredMembers.sort(
      (a, b) =>
        ROLE_PRIORITY[a.role] - ROLE_PRIORITY[b.role] ||
        (a.user?.name || "").localeCompare(b.user?.name || "")
    );
  }, [filteredMembers]);

  return (
    <Wrapper>
      <HeaderWrapper>
        <Search>
          <TextInput
            value={searchQuery}
            extendWidth
            placeholder={t("Search member by name or email")}
            onChange={handleSearch}
          />
        </Search>
        <div>
          {meRole &&
            PermissionService.canInvite(meRole) &&
            !config()?.disableWorkspaceManagement && (
              <Button
                title={t("invite user")}
                appearance="primary"
                icon="memberAdd"
                onClick={() => setAddMemberModalVisible(true)}
              />
            )}
        </div>
      </HeaderWrapper>
      <Table>
        <TableHeaderCell>{t("User Name")}</TableHeaderCell>
        <TableHeaderCell>{t("Email")}</TableHeaderCell>
        <TableHeaderCell>{t("Role")}</TableHeaderCell>
        <TableHeaderCell />
      </Table>

      <ListWrapper>
        {workspace && sortedMembers.length ? (
          sortedMembers.map((member) => (
            <ListItem
              key={member.userId}
              member={member}
              setUpdateRoleModalVisible={setUpdateRoleModalVisible}
              setSelectedMember={setSelectedMember}
              setDeleteMemerModalVisible={setDeleteMemerModalVisible}
              meRole={meRole}
              isLastOwner={sortedMembers.length === 1}
            />
          ))
        ) : (
          <TemplateWrapper>
            <Typography size="body">
              {t("No Member match your search.")}
            </Typography>
          </TemplateWrapper>
        )}
      </ListWrapper>
      {updateRoleModalVisible && selectedMember && (
        <UpdateRoleModal
          workspace={workspace}
          member={selectedMember}
          visible
          onClose={() => setUpdateRoleModalVisible(false)}
          meRole={meRole}
        />
      )}
      {deleteMemerModalVisible && !config()?.disableWorkspaceManagement && (
        <DeleteMemberWarningModal
          workspace={workspace}
          member={selectedMember}
          visible
          onClose={() => setDeleteMemerModalVisible(false)}
        />
      )}
      {addMemberModalVisible && !config()?.disableWorkspaceManagement && (
        <AddMemberModal
          workspace={workspace}
          visible
          onClose={() => setAddMemberModalVisible(false)}
        />
      )}
    </Wrapper>
  );
};

export default Members;

const Wrapper = styled("div")({
  display: "grid",
  gridTemplateRows: "auto auto 1fr",
  height: "100%"
});

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing.super}px`
}));

const Search = styled("div")(({ theme }) => ({
  width: "348px",
  paddingBottom: theme.spacing.small
}));

const ListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  overflowY: "auto",
  padding: theme.spacing.largest
}));

const TemplateWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "70vh"
});

const Table = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px 32px`,
  display: "grid",
  gridTemplateColumns: "3fr 4fr 2fr 1fr",
  gap: theme.spacing.small,
  color: theme.content.main,
  height: `${theme.fonts.lineHeights.h4}px`
}));

const TableHeaderCell = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  color: theme.content.weak,
  lineHeight: `${theme.fonts.lineHeights.body}px`,
  display: "flex",
  alignItems: "center"
}));
