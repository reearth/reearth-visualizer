import { Button, PopupMenu, Typography } from "@reearth/beta/lib/reearth-ui";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { TeamMember } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { Workspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

const ListItem: FC<{
  member: TeamMember;
  currentWorkSpace: Workspace;
  setUpdateRoleModalVisible: (visible: boolean) => void;
  setUpdatingRoleMember: (member: TeamMember) => void;
}> = ({
  member,
  currentWorkSpace,
  setUpdateRoleModalVisible,
  setUpdatingRoleMember
}) => {
  const t = useT();
  const memerRoleTranslation = {
    MAINTAINER: t("MAINTAINER"),
    OWNER: t("OWNER"),
    READER: t("READER"),
    WRITER: t("WRITER")
  };

  const { useRemoveMemberFromWorkspace: removeMember } = useWorkspaceFetcher();
  const handleRemoveMember = useCallback(
    (userId: string) => {
      if (!userId || !currentWorkSpace?.id) return;
      removeMember({ teamId: currentWorkSpace?.id, userId });
    },
    [currentWorkSpace?.id, removeMember]
  );

  const handleUpdateRole = useCallback(
    (member: TeamMember) => {
      setUpdatingRoleMember(member);
      setUpdateRoleModalVisible(true);
    },
    [setUpdateRoleModalVisible, setUpdatingRoleMember]
  );

  return (
    <StyledListItem>
      <Avatar>
        <Typography size="body">
          {member.user?.name.charAt(0).toUpperCase()}
        </Typography>
      </Avatar>
      <TypographyWrapper>
        <Typography size="body">{member.user?.name}</Typography>
      </TypographyWrapper>
      <TypographyWrapper>
        <Typography size="body">{member.user?.email}</Typography>
      </TypographyWrapper>
      <TypographyWrapper>
        <TypographyOfMember size="body">
          {memerRoleTranslation[member.role].toLowerCase()}
        </TypographyOfMember>
      </TypographyWrapper>
      <TypographyWrapper>
        <PopupMenu
          label={
            <Button icon="dotsThreeVertical" iconButton appearance="simple" />
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
      </TypographyWrapper>
    </StyledListItem>
  );
};

export default ListItem;

const StyledListItem = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "0.1fr 2.9fr 4fr 2fr 1fr",
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

const TypographyOfMember = styled(Typography)(() => ({
  textTransform: "capitalize"
}));
