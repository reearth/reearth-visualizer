import { FC, ReactNode } from "react";

import { Icon, IconName, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

import { PopupMenuItem } from "../PopupMenu";

export type BreadcrumbItem = {
  title: string | ReactNode;
  icon?: IconName;
  subItem?: PopupMenuItem[];
};

export type BreadcrumbProp = {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  onClick?: () => void;
};

export const Breadcrumb: FC<BreadcrumbProp> = ({ items = [], separator = " / ", onClick }) => {
  const theme = useTheme();
  return (
    <Wrapper>
      {items.map((item, index) => (
        <ItemWrapper key={index}>
          <Item onClick={onClick}>
            {typeof item.title === "string" ? (
              <>
                {item.icon && <Icon icon={item.icon} size="small" color={theme.content.weak} />}
                <Typography weight="bold" size="body" color={theme.content.weak}>
                  {item.title}
                </Typography>
              </>
            ) : (
              item.title
            )}
          </Item>
          {index < items.length && <Separator>{separator}</Separator>}
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
  cursor: "pointer",
}));

const Item = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.smallest,
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center",
}));

const Separator = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  userSelect: "none",
}));
