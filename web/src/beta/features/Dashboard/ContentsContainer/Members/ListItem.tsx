import { Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { Member } from "../../type";

const ListItem: FC<{ member: Member }> = ({ member }) => {
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
        <Typography size="body">
          {member.role.charAt(0).toUpperCase() +
            member.role.slice(1).toLowerCase()}
        </Typography>
      </TypographyWrapper>
    </StyledListItem>
  );
};

export default ListItem;

const StyledListItem = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "auto 1fr 1fr 1fr",
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

const TypographyWrapper = styled("div")(() => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
}));
