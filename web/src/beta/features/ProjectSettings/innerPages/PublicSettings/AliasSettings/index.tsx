import {
  UrlAction,
  UrlText,
  UrlWrapper
} from "@reearth/beta/features/Editor/Publish/PublishToolsPanel/common";
import { Button, Icon } from "@reearth/beta/lib/reearth-ui";
import CommonField from "@reearth/beta/ui/fields/CommonField";
import {
  useProjectFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { PublicAliasSettingsType } from "..";
import { extractPrefixSuffix } from "../../../hooks";
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
};

const AliasSetting: FC<AliasSettingProps> = ({
  isStory,
  settingsItem,
  onUpdateAlias
}) => {
  const theme = useTheme();
  const t = useT();
  const { checkProjectAlias } = useProjectFetcher();
  const { checkStoryAlias } = useStorytellingFetcher();

  const [, setNotification] = useNotification();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const publicUrl = useMemo(() => {
    const publishedConfig = config()?.published;
    if (!publishedConfig || !settingsItem) return "";
    const [prefix, suffix] = extractPrefixSuffix(publishedConfig);

    const sanitizedAlias = settingsItem.alias?.replace(/^\/+|\/+$/g, "") ?? "";
    return `${prefix}${sanitizedAlias}${suffix}`;
  }, [settingsItem]);

  const handleIconClick = useCallback(() => {
    if (!settingsItem?.alias) return;

    navigator.clipboard.writeText(publicUrl);
    setNotification({
      type: "success",
      text: t("Resource URL copied to clipboard")
    });
  }, [publicUrl, setNotification, settingsItem?.alias, t]);

  const handleSubmitAlias = useCallback(
    (alias?: string) => {
      onUpdateAlias?.({
        alias
      });
    },
    [onUpdateAlias]
  );

  const handleCleanAlias = useCallback(async () => {
    const alias = isStory ? `s-${settingsItem?.id}` : `c-${settingsItem?.id}`;

    const data = isStory
      ? await checkStoryAlias(alias, settingsItem?.id)
      : await checkProjectAlias(alias, settingsItem?.id);
    if (data?.available) {
      handleSubmitAlias(alias);
    }
  }, [
    checkProjectAlias,
    checkStoryAlias,
    handleSubmitAlias,
    isStory,
    settingsItem?.id
  ]);

  const isDisabled = useMemo(
    () =>
      settingsItem?.alias === `c-${settingsItem?.id}` ||
      settingsItem?.alias === `s-${settingsItem?.id}`,
    [settingsItem?.alias, settingsItem?.id]
  );

  return (
    <CommonField title={t("Your Alias")}>
      <Wrapper>
        <UrlWrapper justify="space-between" noPadding>
          <UrlText
            hasPublicUrl
            onClick={() => window.open(publicUrl, "_blank")}
          >
            {publicUrl}
          </UrlText>
          <UrlAction onClick={handleIconClick}>
            <Icon icon="copy" />
          </UrlAction>
        </UrlWrapper>
        <Button
          appearance="secondary"
          title={t("clean")}
          icon="pencilLine"
          size="small"
          disabled={isDisabled}
          iconColor={theme.content.weak}
          onClick={handleCleanAlias}
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
            alias={settingsItem?.alias}
            isStory={isStory}
            itemId={settingsItem?.id}
            publicUrl={publicUrl}
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
