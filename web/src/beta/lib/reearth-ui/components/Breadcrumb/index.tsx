import { FC, ReactNode } from "react";

import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { DropDownMenu } from "./DropDownMenu";

export type ItemsProp = {
  title: string;
  path?: string;
  icon?: IconName;
  breakpoint?: boolean;
  menuItems?: ItemsProp[];
};

export type BreadcrumbProp = {
  items?: Omit<ItemsProp[], "breakpoint">;
  separator?: ReactNode;
  nested?: boolean;
};

export const Breadcrumb: FC<BreadcrumbProp> = ({ items = [], separator = " / ", nested }) => {
  const theme = useTheme();

  return (
    <Wrapper>
      {items.map((item, index) => (
        <ItemWrapper key={index}>
          {item.menuItems ? (
            <DropDownMenu items={item.menuItems} label={item.title} nested={nested} />
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
