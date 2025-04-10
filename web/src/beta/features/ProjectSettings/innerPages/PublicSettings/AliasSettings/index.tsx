import {
  UrlAction,
  UrlText,
  UrlWrapper
} from "@reearth/beta/features/Editor/Publish/PublishToolsPanel/common";
import { Button, Icon } from "@reearth/beta/lib/reearth-ui";
import CommonField from "@reearth/beta/ui/fields/CommonField";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { PublicAliasSettingsType } from "..";

import EditPanel from "./EditPanel";

export type AliasSettingProps = {
  alias: string;
  isStory?: boolean;
  onUpdateAlias: (settings: PublicAliasSettingsType) => void;
  onClose?: () => void;
};
const AliasSetting: FC<AliasSettingProps> = ({
  alias,
  isStory,
  onUpdateAlias
}) => {
  const theme = useTheme();
  const t = useT();
  const [, setNotification] = useNotification();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const publicUrl = useMemo(() => {
    const publishedConfig = config()?.published;
    if (!publishedConfig) return "";

    const [prefix, suffix] = publishedConfig.split("{}");
    const sanitizedAlias = alias?.replace(/^\/+|\/+$/g, "") ?? "";

    return `${prefix}${sanitizedAlias}${suffix}`;
  }, [alias]);

  const handleIconClick = useCallback(() => {
    if (!alias) return;
    navigator.clipboard.writeText(publicUrl);
    setNotification({
      type: "success",
      text: t("Resource URL copied to clipboard")
    });
  }, [alias, publicUrl, setNotification, t]);

  return (
    <CommonField title={t("Your Alias")}>
      <Wrapper>
        <UrlWrapper justify="space-between" noPadding>
          <UrlText hasPublicUrl>{publicUrl}</UrlText>
          <UrlAction onClick={handleIconClick}>
            <Icon icon="copy" />
          </UrlAction>
        </UrlWrapper>
        <Button
          appearance="secondary"
          title={t("clean")}
          icon="pencilLine"
          size="small"
          disabled
          iconColor={theme.content.weak}
          onClick={handleOpen}
        />

        <Button
          appearance="secondary"
          title={t("Edit Alias")}
          icon="pencilSimple"
          size="small"
          onClick={handleOpen}
        />

        {open && (
          <EditPanel
            alias={alias}
            isStory={isStory}
            onClose={handleClose}
            onUpdateAlias={onUpdateAlias}
          />
        )}
      </Wrapper>
    </CommonField>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  flexWrap: "wrap",
  width: "100%"
}));

export default AliasSetting;
