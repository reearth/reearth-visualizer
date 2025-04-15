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
import {
  SettingsProjectWithTypename,
  StoryWithTypename
} from "../PublicSettingsDetail";

import EditPanel from "./EditPanel";

export type AliasSettingProps = {
  isStory?: boolean;
  alias?: string;
  settingsItem?: SettingsProjectWithTypename | StoryWithTypename;
  onUpdateAlias?: (settings: PublicAliasSettingsType) => void;
  onClose?: () => void;
  onSubmit?: (alias?: string) => void;
};
const AliasSetting: FC<AliasSettingProps> = ({
  isStory,
  settingsItem,
  onUpdateAlias
}) => {
  const theme = useTheme();
  const t = useT();
  const [, setNotification] = useNotification();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const alias = useMemo(
    () => (settingsItem?.alias ? settingsItem.alias : settingsItem?.id),
    [settingsItem?.alias, settingsItem?.id]
  );

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

  const handleSubmitAlias = useCallback(
    (alias?: string) => {
        onUpdateAlias?.({
          alias
        });
    },
    [onUpdateAlias]
  );

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
          disabled={settingsItem?.id === alias}
          iconColor={theme.content.weak}
          onClick={() => handleSubmitAlias(alias)}
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
            onSubmit={handleSubmitAlias}
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
