import {
  Button,
  Icon,
  IconButton,
  Markdown,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useState } from "react";

import { type PluginItem } from ".";

type PluginListItemProps = {
  plugin: PluginItem;
  uninstallPlugin: (pluginId: string) => void;
};

const PluginListItem: FC<PluginListItemProps> = ({
  plugin: { title, pluginId, isInstalled, bodyMarkdown },
  uninstallPlugin
}) => {
  const t = useT();
  const theme = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  const version = pluginId.split("~")[2] ?? "x.x.x";

  return (
    <Wrapper>
      <Header>
        <InfoWrapper>
          <IconButton
            icon="triangle"
            appearance="simple"
            iconRotate={collapsed ? "180deg" : "270deg"}
            onClick={() => setCollapsed(!collapsed)}
          />
          <TitleWrapper>
            <Typography size="body" weight="bold">
              {title}
            </Typography>
          </TitleWrapper>
          <VersionWrapper>
            <Typography size="body">v{version}</Typography>
          </VersionWrapper>
        </InfoWrapper>
        <Button
          appearance={isInstalled && hovered ? "dangerous" : "secondary"}
          icon={isInstalled ? (hovered ? "trash" : "check") : "install"}
          title={
            isInstalled
              ? hovered
                ? t("Uninstall")
                : t("Installed")
              : t("Install")
          }
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          minWidth={153}
          onClick={
            isInstalled
              ? (e) => {
                  setIsModalOpen(true);
                  e.stopPropagation();
                }
              : undefined
          }
        />
        <Modal visible={isModalOpen} size="small">
          <ModalPanel
            layout="common"
            appearance="simple"
            onCancel={() => setIsModalOpen(false)}
            actions={[
              <Button
                key="cancel"
                appearance="secondary"
                title={t("Cancel")}
                onClick={() => setIsModalOpen(false)}
              />,
              <Button
                key="delete"
                appearance="dangerous"
                title={t("Delete")}
                onClick={() => {
                  setIsModalOpen(false);
                  uninstallPlugin(pluginId);
                }}
              />
            ]}
          >
            <WarningIcon>
              <Icon icon="warning" size={24} />
            </WarningIcon>
            <Typography size="body">
              {t(
                "You are uninstalling the selected plugin. The data used by this plugin may also be deleted."
              )}
            </Typography>
            <Typography size="body">
              {t("Please be sure before uninstalling.")}
            </Typography>
          </ModalPanel>
        </Modal>
      </Header>
      {!collapsed && (
        <>
          {bodyMarkdown ? (
            <Markdown
              className="plugin-description-md"
              styles={{
                color: theme.content.main,
                fontSize: theme.fonts.sizes.body
              }}
            >
              {bodyMarkdown}
            </Markdown>
          ) : (
            <Typography size="body" color={theme.content.weak}>
              {t("No description.")}
            </Typography>
          )}
        </>
      )}
    </Wrapper>
  );
};

export default PluginListItem;

const Wrapper = styled("div")(({ theme }) => ({
  borderRadius: theme.radius.large,
  padding: theme.spacing.normal,
  backgroundColor: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.normal
}));

const InfoWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.normal,
  flex: 1
}));

const TitleWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  width: "70%"
}));

const VersionWrapper = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  flexShrink: 0
}));

const WarningIcon = styled("div")(({ theme }) => ({
  color: theme.dangerous.main
}));
