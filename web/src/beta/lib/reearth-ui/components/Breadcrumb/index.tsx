import { FC, ReactNode } from "react";

import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { DropDownMenu } from "./dropdownMenu";

export type ItemsProp = {
  title?: string;
  path?: string;
  icon?: IconName;
  menuItems?: ItemsProp[];
};

export type BreadcrumbProp = {
  items?: ItemsProp[];
  separator?: ReactNode;
};

export const Breadcrumb: FC<BreadcrumbProp> = ({ items = [], separator = " / " }) => {
  const theme = useTheme();

  return (
    <Wrapper>
      {items.map((item, index) => (
        <ItemWrapper key={index}>
          {item.menuItems ? (
            <DropDownMenu itemIcon={item.icon} items={item.menuItems} label={item.title} />
          ) : (
            <Item>
              {item.icon && <Icon icon={item.icon} size="small" color={theme.content.weak} />}
              <Typography color={theme.content.weak} weight="bold" size="body">
                {item.title}
              </Typography>
            </Item>
          )}

          {index < items.length - 1 && <Separator>{separator}</Separator>}
        </ItemWrapper>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
}));

const ItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  color: theme.content.weak,
  cursor: "pointer",
}));

const Item = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.smallest,
  ["&:hover"]: {
    backgroundColor: theme.bg[2],
  },
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
}));

const Separator = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  userSelect: "none",
}));
