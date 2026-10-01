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
import {
  DATA_SERVICE_URLS,
  MAP_ENGINE_URLS
} from "@reearth/services/config/constants";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router";

export type ProductId = "dashboard" | "visualizer" | "cms";
export type MapEngineId = "navara";
export type DataServiceId = "terrain" | "buildings" | "paper";
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

type MapEngineItem = {
  id: MapEngineId;
  title: string;
  description: string;
  icon: IconName;
  background?: string;
  onNavigate?: () => void;
};

type DataServiceItem = {
  id: DataServiceId;
  title: string;
  description: string;
  disabled?: boolean;
  onNavigate?: () => void;
};

export type ProductsMenuProps = {
  workspaceId?: string;
  onSelect?: (
    id: ProductId | MapEngineId | DataServiceId | OtherLinkId
  ) => void;
};

const ProductsMenu: FC<ProductsMenuProps> = ({ workspaceId, onSelect }) => {
  const t = useT();
  const c = config();
  const theme = useTheme();
  const navigate = useNavigate();

  const platformUrl = c?.platformUrl;
  const cmsUrl = c?.cmsUrl;
  const homeUrl = platformUrl
    ? `${platformUrl.replace(/\/+$/, "")}/home`
    : undefined;

  const goToDashboard = workspaceId
    ? () => navigate(`/dashboard/${workspaceId}`)
    : undefined;

  const handleAction = useCallback(
    (item: MenuItem | MapEngineItem | DataServiceItem) => () => {
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

  const mapEngines: MapEngineItem[] = [
    {
      id: "navara",
      title: "Navara",
      description: t("3D map engine, MapLibre family"),
      icon: "navaraLogo",
      background: "#313F42",
      onNavigate: () => openUrlInNewTab(MAP_ENGINE_URLS.NAVARA)
    }
  ];

  const dataServices: DataServiceItem[] = [
    {
      id: "terrain",
      title: "Terrain",
      description: t("Open terrain tiles for 3D globes"),
      onNavigate: () => openUrlInNewTab(DATA_SERVICE_URLS.TERRAIN)
    },
    {
      id: "buildings",
      title: "Buildings",
      description: t("Open 3D buildings tiles for the world"),
      onNavigate: () => openUrlInNewTab(DATA_SERVICE_URLS.BUILDINGS)
    },
    {
      id: "paper",
      title: "Papers",
      description: t("Open Map Tile Service"),
      onNavigate: () => openUrlInNewTab(DATA_SERVICE_URLS.PAPER)
    }
  ];

  const otherLinks: MenuItem[] = [
    {
      id: "home",
      title: t("Re:Earth Home"),
      icon: "home",
      onNavigate: homeUrl ? () => openUrlInNewTab(homeUrl) : undefined
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
      <Panel width={330}>
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
          <Typography size="footnote">{t("Map engine")}</Typography>
          {mapEngines.map((engine) => (
            <MapEngineButton
              key={engine.id}
              type="button"
              onClick={handleAction(engine)}
            >
              <ProductIcon background={engine.background}>
                <Icon size={32} icon={engine.icon} />
              </ProductIcon>
              <MapEngineText>
                <TitleWithArrow>
                  <Typography size="body">{engine.title}</Typography>
                  <Icon
                    icon="arrowExternalLink"
                    size="small"
                    color={theme.content.weak}
                  />
                </TitleWithArrow>
                <Typography size="body" color="#B1B1B1">
                  {engine.description}
                </Typography>
              </MapEngineText>
            </MapEngineButton>
          ))}
          <Divider />
          <Typography size="footnote">{t("Re:Earth data services")}</Typography>
          <DataServiceList>
            {dataServices.map((service) => (
              <DataServiceRow key={service.id}>
                <DataServiceLabel type="button" onClick={handleAction(service)}>
                  <Typography size="body">{service.title}</Typography>
                  <Icon
                    icon="arrowExternalLink"
                    size="small"
                    color={theme.content.weak}
                  />
                </DataServiceLabel>
                <Typography size="body" color="#B1B1B1">
                  {service.description}
                </Typography>
              </DataServiceRow>
            ))}
          </DataServiceList>
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
  "&:focus-visible": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
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

const MapEngineButton = styled("button")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.normal,
  padding: theme.spacing.small,
  borderRadius: theme.radius.normal,
  textAlign: "left",
  cursor: css.cursor.pointer,
  "&:focus-visible": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
  },
  "&:hover": {
    backgroundColor: theme.bg[2]
  }
}));

const MapEngineText = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  minWidth: 0
}));

const TitleWithArrow = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest
}));

const DataServiceList = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal
}));

const DataServiceRow = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart
}));

// The negative margin cancels the padding, so the hover background can breathe
// around the title without shifting the text when a row is hovered.
const DataServiceLabel = styled("button")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `${theme.spacing.micro}px ${theme.spacing.smallest}px`,
  margin: `-${theme.spacing.micro}px -${theme.spacing.smallest}px`,
  borderRadius: theme.radius.small,
  cursor: css.cursor.pointer,
  "&:focus-visible": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
  },
  "&:hover": {
    backgroundColor: theme.bg[2]
  }
}));

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
  padding: `6px ${theme.spacing.normal}px`,
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "99px",
  color: "#B1B1B1",
  fontSize: theme.fonts.sizes.body,
  cursor: css.cursor.pointer,
  "&:focus-visible": {
    outline: `2px solid ${theme.primary.main}`,
    outlineOffset: "2px"
  },
  backgroundColor: theme.bg[0],
  "&:hover": {
    backgroundColor: theme.select.main,
    border: `1px solid ${theme.select.main}`,
    color: theme.content.main
  }
}));
