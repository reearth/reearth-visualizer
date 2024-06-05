import { FC, useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { Popup, Icon, Typography, IconName } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { ItemsProp } from ".";

export type DropdownMenuProps = {
  label?: string;
  items: ItemsProp[];
  itemIcon?: IconName;
};

export const DropdownMenu: FC<DropdownMenuProps> = ({ label, items, itemIcon }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  return (
    <Popup
      open={open}
      placement="bottom-start"
      onOpenChange={handlePopOver}
      trigger={
        <TriggerWrapper onClick={handlePopOver}>
          {itemIcon && <Icon icon={itemIcon} size="small" color={theme.content.weak} />}
          <Typography color={theme.content.weak} weight="bold" size="body">
            {label}
          </Typography>
          <Icon icon="caretDown" size="small" />
        </TriggerWrapper>
      }>
      <DropDownWrapper>
        {items?.map(({ title: itemName, path, icon }, index) => (
          <DropDownItem key={index}>
            {icon && <Icon icon={icon} size="small" color={theme.content.weak} />}
            {path ? (
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
  outline: "none",
  cursor: "pointer",
  ["&:hover"]: {
    backgroundColor: `${theme.bg[2]}`,
  },
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));
