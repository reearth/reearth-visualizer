import { Button, TextInput, Typography } from "@reearth/app/lib/reearth-ui";
import { useMe } from "@reearth/services/api/user";
import { useWorkspace } from "@reearth/services/api/workspace";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { Role, WorkspaceMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useMemo, useState } from "react";

import { Workspace } from "../../type";

import AddMemberModal from "./AddMemberModal";
import DeleteMemberWarningModal from "./DeleteMemberWarningModal";
import ListItem from "./ListItem";
import { PermissionService } from "./PermissionService";
import UpdateRoleModal from "./UpdateRoleModal";

const ROLE_PRIORITY = { OWNER: 1, MAINTAINER: 2, WRITER: 3, READER: 4 };

type Props = { currentWorkspace?: Workspace };

const Members: FC<Props> = ({ currentWorkspace }) => {
  const { workspace } = useWorkspace(currentWorkspace?.id);
  const { me } = useMe();
  const meId = me?.id;
  const meRole = useMemo(
    () => workspace?.members.find((m) => m.userId === meId)?.role,
    [workspace, meId]
  );
  const t = useT();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedMember, setSelectedMember] = useState<WorkspaceMember>();
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [updateRoleModalVisible, setUpdateRoleModalVisible] = useState(false);
  const [deleteMemberModalVisible, setDeleteMemberModalVisible] =
    useState(false);

  const members = useMemo(() => workspace?.members ?? [], [workspace?.members]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Derived rather than mirrored in state: the member list is refetched after every
  // invite/remove/role change, and a state copy would silently fall back to showing
  // everyone while the search box still displayed the query.
  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter(({ user }) =>
      [user?.name, user?.email].some((str) => str?.toLowerCase().includes(query))
    );
  }, [members, searchQuery]);

  const sortedMembers = useMemo(
    () =>
      // Copy before sorting: `members` is the Apollo cache result, which is
      // deep-frozen in development, and Array#sort reorders in place.
      [...filteredMembers].sort(
        (a, b) =>
          ROLE_PRIORITY[a.role] - ROLE_PRIORITY[b.role] ||
          (a.user?.name || "").localeCompare(b.user?.name || "")
      ),
    [filteredMembers]
  );

  // A workspace must keep at least one owner or it becomes unmanageable. Counted
  // over every member, not the filtered view, so searching can't change the answer.
  const ownerCount = useMemo(
    () => members.filter((m) => m.role === Role.Owner).length,
    [members]
  );

  const { membersManagementOnDashboard } = appFeature();

  if (!membersManagementOnDashboard) return null;

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
          {meRole && PermissionService.canInvite(meRole) && (
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
              setDeleteMemberModalVisible={setDeleteMemberModalVisible}
              meRole={meRole}
              isLastOwner={member.role === Role.Owner && ownerCount <= 1}
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
      {deleteMemberModalVisible && selectedMember && (
        <DeleteMemberWarningModal
          workspace={workspace}
          member={selectedMember}
          visible
          onClose={() => setDeleteMemberModalVisible(false)}
        />
      )}
      {addMemberModalVisible && (
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
  display: css.display.grid,
  gridTemplateRows: "auto auto 1fr",
  height: "100%"
});

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.spaceBetween,
  alignItems: css.alignItems.center,
  padding: `${theme.spacing.super}px`
}));

const Search = styled("div")(({ theme }) => ({
  width: "348px",
  paddingBottom: theme.spacing.small
}));

const ListWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal,
  overflowY: css.overflow.auto,
  padding: theme.spacing.largest
}));

const TemplateWrapper = styled("div")({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  height: "70vh"
});

const Table = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px 32px`,
  display: css.display.grid,
  gridTemplateColumns: "3fr 4fr 2fr 1fr",
  gap: theme.spacing.small,
  color: theme.content.main,
  height: `${theme.fonts.lineHeights.h4}px`
}));

const TableHeaderCell = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  color: theme.content.weak,
  lineHeight: `${theme.fonts.lineHeights.body}px`,
  display: css.display.flex,
  alignItems: css.alignItems.center
}));
