import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { ItemsProp } from ".";

type DropDownMenuProps = {
  label?: string;
  items: ItemsProp[];
  nested?: boolean;
};

export const DropDownMenu: FC<DropDownMenuProps> = ({ label, items, nested }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  return (
    <Popup
      open={open}
      placement={nested ? "right-start" : "bottom-start"}
      onOpenChange={handlePopOver}
      trigger={
        <TriggerWrapper onClick={handlePopOver}>
          <Typography color={theme.content.weak} weight={nested ? "regular" : "bold"} size="body">
            {label}
          </Typography>
          <Icon icon="caretDown" size="small" />
        </TriggerWrapper>
      }>
      <DropDownWrapper>
        {items?.map(({ title: itemName, path, breakpoint, icon, menuItems }, index) => (
          <DropDownItem key={index}>
            {icon && <Icon icon={icon} size="small" color={theme.content.weak} />}
            {breakpoint ? (
              <Spacer />
            ) : menuItems ? (
              <DropDownMenu label={itemName} items={items} nested />
            ) : path ? (
              <StyledLink to={path}>
                <Typography size="body">{itemName}</Typography>
              </StyledLink>
            ) : (
              <Typography size="body">{itemName}</Typography>
            )}
          </DropDownItem>
        ))}
      </DropDownWrapper>
    </Popup>
  );
};

const TriggerWrapper = styled("div")(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.smallest,
  ["&:hover"]: {
    backgroundColor: theme.bg[2],
  },
}));

const DropDownWrapper = styled("div")<{}>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.micro}px`,
  padding: `${theme.spacing.micro}px`,
  backgroundColor: `${theme.bg[1]}`,
  boxShadow: `${theme.shadow.popup}`,
  borderRadius: `${theme.radius.small}px`,
  minWidth: "180px",
}));

const DropDownItem = styled("div")<{}>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: `${theme.spacing.small}px`,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  borderRadius: `${theme.radius.smallest}px`,
  cursor: "pointer",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));

const Spacer = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weak}`,
  margin: `${theme.spacing.micro} 0`,
}));
