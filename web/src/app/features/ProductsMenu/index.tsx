import {
  Icon,
  IconButton,
  IconName,
  Panel,
  Popup,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { openUrlInNewTab } from "@reearth/app/utils/url";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router";

export type ProductId = "dashboard" | "visualizer" | "cms" | "flow";
export type OtherLinkId = "home" | "community";

type MenuItem = {
  id: ProductId | OtherLinkId;
  title: string;
  icon: IconName;
  iconColor?: string;
  background?: string;
  disabled?: boolean;
  onNavigate?: () => void;
};

export type ProductsMenuProps = {
  workspaceId?: string;
  onSelect?: (id: ProductId | OtherLinkId) => void;
};

const ProductsMenu: FC<ProductsMenuProps> = ({ workspaceId, onSelect }) => {
  const t = useT();
  const c = config();
  const navigate = useNavigate();

  const platformUrl = c?.platformUrl;
  const cmsUrl = c?.cmsUrl;

  const goToDashboard = workspaceId
    ? () => navigate(`/dashboard/${workspaceId}`)
    : undefined;

  const handleAction = useCallback(
    (item: MenuItem) => () => {
      item.onNavigate?.();
      onSelect?.(item.id);
    },
    [onSelect]
  );

  const products: MenuItem[] = [
    {
      id: "dashboard",
      title: t("Dashboard"),
      icon: "logoFullColor",
      background: "#494735",
      onNavigate: platformUrl ? () => openUrlInNewTab(platformUrl) : undefined
    },
    {
      id: "visualizer",
      title: t("Visualizer"),
      icon: "logo",
      iconColor: brandRed.dynamicRed,
      background: "#4A3131",
      onNavigate: goToDashboard
    },
    {
      id: "cms",
      title: t("CMS"),
      icon: "cmsLogo",
      background: "#4B3F22",
      onNavigate: cmsUrl ? () => openUrlInNewTab(cmsUrl) : undefined
    }
  ];

  const otherLinks: MenuItem[] = [
    {
      id: "home",
      title: t("Re:Earth Home"),
      icon: "home",
      onNavigate: platformUrl
        ? () => openUrlInNewTab(`${platformUrl}/home`)
        : undefined
    },
    {
      id: "community",
      title: t("Community"),
      icon: "discord",
      onNavigate: () => openUrlInNewTab("https://discord.com/invite/XJhYkQQDAu")
    }
  ];

  return (
    <Popup
      placement="bottom-start"
      offset={8}
      autoClose
      trigger={
        <IconButton icon="dotsNineVertical" appearance="simple" size="large" />
      }
    >
      <Panel width={300}>
        <ContentWrapper>
          <Typography size="footnote">{t("Re:Earth products")}</Typography>
          <Grid>
            {products.map((product) => (
              <ProductButton
                key={product.id}
                type="button"
                disabled={product.disabled}
                onClick={handleAction(product)}
              >
                <ProductIcon background={product.background}>
                  <Icon
                    size={32}
                    icon={product.icon}
                    color={product.iconColor}
                  />
                </ProductIcon>
                <Typography size="body">{product.title}</Typography>
              </ProductButton>
            ))}
          </Grid>
          <Divider />
          <Typography size="footnote">{t("Other")}</Typography>
          <OtherRow>
            {otherLinks.map((link) => (
              <PillButton
                key={link.id}
                type="button"
                onClick={handleAction(link)}
              >
                <Icon icon={link.icon} size="normal" />
                <span>{link.title}</span>
              </PillButton>
            ))}
          </OtherRow>
        </ContentWrapper>
      </Panel>
    </Popup>
  );
};

export default ProductsMenu;

const ContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  padding: theme.spacing.large,
  gap: theme.spacing.normal
}));

const Grid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: theme.spacing.normal
}));

const ProductButton = styled("button")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.normal,
  cursor: css.cursor.pointer,
  "&:disabled": {
    cursor: css.cursor.notAllowed,
    opacity: 0.5
  },
  "&:hover": {
    backgroundColor: theme.bg[2]
  }
}));

const ProductIcon = styled("div")<{ background?: string }>(
  ({ background, theme }) => ({
    padding: theme.spacing.normal,
    borderRadius: theme.radius.large,
    backgroundColor: background
  })
);

const Divider = styled("div")(({ theme }) => ({
  height: "1px",
  background: theme.outline.weaker
}));

const OtherRow = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small
}));

const PillButton = styled("button")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  padding: theme.spacing.small,
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "99px",
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  cursor: css.cursor.pointer,
  "&:hover": {
    backgroundColor: theme.bg[2]
  }
}));
