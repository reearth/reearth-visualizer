import {
  UrlAction,
  UrlText,
  UrlWrapper
} from "@reearth/app/features/Editor/Publish/PublishToolsPanel/common";
import { Button, Icon } from "@reearth/app/lib/reearth-ui";
import CommonField from "@reearth/app/ui/fields/CommonField";
import { useValidateSceneAlias } from "@reearth/services/api/scene";
import { useValidateStoryAlias } from "@reearth/services/api/storytelling";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
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
  sceneId?: string;
  settingsItem?: SettingsProjectWithTypename | StoryWithTypename;
  onUpdateAlias?: (settings: PublicAliasSettingsType) => void;
};

const AliasSetting: FC<AliasSettingProps> = ({
  isStory,
  sceneId,
  settingsItem,
  onUpdateAlias
}) => {
  const t = useT();
  const { validateSceneAlias } = useValidateSceneAlias();
  const { validateStoryAlias } = useValidateStoryAlias();

  const [, setNotification] = useNotification();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const settingItemAlias = useMemo(() => {
    return settingsItem?.type === "project" && "scene" in settingsItem
      ? settingsItem.scene?.alias
      : settingsItem?.alias;
  }, [settingsItem]);

  const publicUrl = useMemo(() => {
    const publishedConfig = config()?.published;
    if (!publishedConfig || !settingsItem) return "";
    const [prefix, suffix] = extractPrefixSuffix(publishedConfig);

    const sanitizedAlias = settingItemAlias?.replace(/^\/+|\/+$/g, "") ?? "";
    return `${prefix}${sanitizedAlias}${suffix}`;
  }, [settingItemAlias, settingsItem]);

  const handleIconClick = useCallback(() => {
    if (!settingItemAlias) return;

    navigator.clipboard.writeText(publicUrl);
    setNotification({
      type: "success",
      text: t("Resource URL copied to clipboard")
    });
  }, [publicUrl, setNotification, settingItemAlias, t]);

  const handleSubmitAlias = useCallback(
    (alias?: string) => {
      onUpdateAlias?.({
        alias
      });
    },
    [onUpdateAlias]
  );

  const handleCleanAlias = useCallback(async () => {
    if ((isStory && !settingsItem?.id) || (!isStory && !sceneId)) return;

    // Default alias
    // `c-${scene.id}` for published map (scene)
    // `s-${story.id}` for published story
    const alias = isStory ? `s-${settingsItem?.id}` : `c-${sceneId}`;

    const data = isStory
      ? await validateStoryAlias(alias, settingsItem?.id)
      : await validateSceneAlias(alias, settingsItem?.id);
    if (data?.available) {
      handleSubmitAlias(alias);
    }
  }, [
    isStory,
    settingsItem?.id,
    sceneId,
    validateStoryAlias,
    validateSceneAlias,
    handleSubmitAlias
  ]);

  const isDisabled = useMemo(
    () =>
      (!isStory && !sceneId) ||
      settingItemAlias === `c-${sceneId}` ||
      settingItemAlias === `s-${settingsItem?.id}`,
    [isStory, sceneId, settingItemAlias, settingsItem?.id]
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
          title={t("Reset")}
          icon="pencilLine"
          size="small"
          disabled={isDisabled}
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
            alias={settingItemAlias}
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
  display: css.display.flex,
  gap: theme.spacing.small,
  flexWrap: "wrap",
  width: "100%"
}));

export default AliasSetting;
