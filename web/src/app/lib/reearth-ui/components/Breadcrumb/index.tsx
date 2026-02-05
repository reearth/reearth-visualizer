import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

import { PopupMenuItem } from "../PopupMenu";

export type BreadcrumbItem = {
  title: string | ReactNode;
  id?: string;
  icon?: IconName;
  subItem?: PopupMenuItem[];
};

export type BreadcrumbProp = {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  size?: "normal" | "large";
  onClick?: (id?: string) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

export const Breadcrumb: FC<BreadcrumbProp> = ({
  items = [],
  separator = " / ",
  size,
  onClick,
  ariaLabel,
  dataTestid
}) => {
  const theme = useTheme();
  return (
    <Wrapper as="nav" aria-label={ariaLabel} data-testid={dataTestid}>
      {items.map((item, index) => (
        <ItemWrapper key={index}>
          <Item onClick={() => onClick?.(item.id)}>
            {typeof item.title === "string" ? (
              <>
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    size="small"
                    color={theme.content.weak}
                    aria-hidden="true"
                  />
                )}
                <Typography
                  weight="bold"
                  size={size === "normal" ? "body" : "h5"}
                  color={theme.content.weak}
                >
                  {item.title}
                </Typography>
              </>
            ) : (
              item.title
            )}
          </Item>
          {index < items.length - 1 && (
            <Separator aria-hidden="true">{separator}</Separator>
          )}
        </ItemWrapper>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest
}));

const ItemWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  cursor: "pointer"
}));

const Item = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.smallest,
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const Separator = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  userSelect: "none"
}));
