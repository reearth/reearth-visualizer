import { FC } from "react";

import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import { Member } from "../../type";

export const List: FC<{ member: Member }> = ({ member }) => {
  return (
    <ListItem>
      <Avatar>
        <Typography size="body">{member.user?.name.charAt(0).toUpperCase()}</Typography>
      </Avatar>
      <ItemWrapper>
        <Typography size="body">{member.user?.name}</Typography>
      </ItemWrapper>
      <ItemWrapper>
        <Typography size="body">{member.user?.email}</Typography>
      </ItemWrapper>
      <ItemWrapper>
        <Typography size="body">
          {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
        </Typography>
      </ItemWrapper>
    </ListItem>
  );
};

const ListItem = styled("div")(({ theme }) => ({
  display: "flex",
  padding: `${theme.spacing.small}px ${theme.spacing.normal}px`,
  alignItems: "center",
  background: theme.bg[1],
  borderRadius: theme.radius.normal,
  gap: theme.spacing.small,
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ItemWrapper = styled("div")(() => ({
  flex: 1,
}));
