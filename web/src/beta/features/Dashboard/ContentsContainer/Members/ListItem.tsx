import { Button, PopupMenu, Typography } from "@reearth/beta/lib/reearth-ui";
import { config } from "@reearth/services/config";
import { Role, TeamMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

import { PermissionService } from "./PermissionService";

const ListItem: FC<{
  member: TeamMember;
  setUpdateRoleModalVisible: (visible: boolean) => void;
  setSelectedMember: (member: TeamMember) => void;
  setDeleteMemerModalVisible: (visible: boolean) => void;
  meRole: Role | undefined;
  //when the item is the last owner, it can't be removed or modified
  isLastOwner: boolean;
}> = ({
  member,
  setUpdateRoleModalVisible,
  setSelectedMember,
  setDeleteMemerModalVisible,
  meRole,
  isLastOwner
}) => {
  const t = useT();

  const handleUpdateRole = useCallback(
    (member: TeamMember) => {
      setSelectedMember(member);
      setUpdateRoleModalVisible(true);
    },
    [setUpdateRoleModalVisible, setSelectedMember]
  );

  const handleDeleteRole = useCallback(
    (member: TeamMember) => {
      setSelectedMember(member);
      setDeleteMemerModalVisible(true);
    },
    [setDeleteMemerModalVisible, setSelectedMember]
  );

  return (
    <StyledListItem>
      <UserWrapper>
        <Avatar>
          <Typography size="body">
            {member.user?.name.charAt(0).toUpperCase()}
          </Typography>
        </Avatar>
        <TypographyWrapper>
          <Typography size="body">{member.user?.name}</Typography>
        </TypographyWrapper>
      </UserWrapper>
      <TypographyWrapper>
        <Typography size="body">{member.user?.email}</Typography>
      </TypographyWrapper>
      <TypographyWrapper>
        <TypographyOfMember size="body">
          {PermissionService.getRoleLabel(t, member.role)}
        </TypographyOfMember>
      </TypographyWrapper>

      <TypographyWrapper>
        {!config()?.disableWorkspaceManagement && meRole && (
          <PopupMenu
            label={
              <Button icon="dotsThreeVertical" iconButton appearance="simple" />
            }
            menu={[
              {
                icon: "arrowLeftRight",
                id: "changeRole",
                title: t("Change Role"),
                disabled: PermissionService.canModify(
                  meRole,
                  member.role,
                  isLastOwner
                ),
                onClick: () => handleUpdateRole(member)
              },
              {
                icon: "close",
                id: "remove",
                title: t("Remove"),
                disabled: PermissionService.canRemove(
                  meRole,
                  member.role,
                  isLastOwner
                ),
                onClick: () => handleDeleteRole(member)
              }
            ]}
          />
        )}
      </TypographyWrapper>
    </StyledListItem>
  );
};

export default ListItem;

const StyledListItem = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "3.0fr 4fr 2fr 1fr",
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  alignItems: "center",
  borderRadius: theme.radius.normal,
  gap: theme.spacing.small
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const TypographyWrapper = styled("div")(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis"
}));

const UserWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.small}px`
}));

const TypographyOfMember = styled(Typography)(() => ({
  textTransform: "capitalize"
}));
