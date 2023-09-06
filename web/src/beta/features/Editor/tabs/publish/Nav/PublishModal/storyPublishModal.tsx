import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import useHooks, { type PublishStatus } from "./hooks";
import {
  Section,
  Subtitle,
  ArrowIcon,
  PublishLink,
  UrlText,
  OptionsToggle,
  HideableSection,
  StyledIcon,
} from "./publish.styled";

export type publishingType = "publishing" | "updating" | "unpublishing";

type Props = {
  isVisible: boolean;
  className?: string;
  loading?: boolean;
  publishStoryStatus?: PublishStatus;
  storyId?: string;
  storyAlias?: string;
  publishing?: publishingType;
  url?: string[];
  onPublish: (alias: string | undefined, publishStoryStatus: PublishStatus) => void | Promise<void>;
  onClose?: () => void;
  onCopyToClipBoard?: () => void;
};

const PublishStoryModal: React.FC<Props> = ({
  isVisible,
  loading,
  publishing,
  publishStoryStatus,
  storyAlias,
  url,
  onClose,
  onPublish,
  onCopyToClipBoard,
}) => {
  const t = useT();
  const theme = useTheme();

  const {
    statusChanged,
    alias,
    showOptions,
    searchIndex,
    handlePublish,
    handleClose,
    handleCopyToClipBoard,
    handleSearchIndexChange,
    setOptions,
  } = useHooks(publishing, publishStoryStatus, storyAlias, onPublish, onClose, onCopyToClipBoard);

  const purl = useMemo(() => {
    return (url?.[0] ?? "") + (alias?.replace("/", "") ?? "") + (url?.[1] ?? "");
  }, [alias, url]);

  const embedCode = useMemo(
    () => `<iframe width="560" height="315" src="${purl}" frameBorder="0"></iframe>;`,
    [purl],
  );

  const publishDisabled = useMemo(
    () => loading || publishing === "publishing" || publishing === "updating",
    [loading, publishing],
  );

  const modalTitleText = useMemo(() => {
    return statusChanged
      ? t("Congratulations!")
      : publishing === "publishing"
      ? t("Publish your story")
      : publishing === "updating"
      ? t("Update your story")
      : "";
  }, [t, statusChanged, publishing]);

  const primaryButtonText = useMemo(() => {
    return statusChanged
      ? t("Ok")
      : publishing === "publishing"
      ? t("Publish")
      : publishing === "updating"
      ? t("Update")
      : t("Continue");
  }, [t, statusChanged, publishing]);

  console.log(publishing);

  const secondaryButtonText = useMemo(() => (!statusChanged ? "Cancel" : "Close"), [statusChanged]);

  const updateDescriptionText = useMemo(() => {
    return publishing === "updating"
      ? t(
          "Your published story will be updated. This means all current changes will overwrite the current published story.",
        )
      : t(
          "Your story will be published. This means anybody with the below URL will be able to view this story.",
        );
  }, [t, publishing]);

  return (
    <Modal
      isVisible={isVisible}
      size="sm"
      title={modalTitleText}
      button1={<Button text={secondaryButtonText} buttonType="secondary" onClick={handleClose} />}
      button2={
        !statusChanged && (
          <Button
            text={primaryButtonText}
            buttonType="primary"
            disabled={publishDisabled}
            onClick={handlePublish}
          />
        )
      }
      onClose={handleClose}>
      {statusChanged ? (
        <Section>
          <Subtitle size="body">{t("Your story has been published!")}</Subtitle>
          <Subtitle size="body">{t("Public URL")}</Subtitle>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <Text size="body" color={theme.select.strong}>
                {purl}
              </Text>
              <Button onClick={handleCopyToClipBoard("url", purl)}>{t("Copy")}</Button>
            </div>
            <Text size="footnote">{t("* Anyone can see your story with this URL")}</Text>
          </div>
          <Subtitle size="body">{t("Embed Code")}</Subtitle>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <Text size="footnote" color={theme.select.strong}>
                {embedCode}
              </Text>
              <Button onClick={handleCopyToClipBoard("embedCode", embedCode)}>{t("Copy")}</Button>
            </div>
            <Text size="xFootnote">
              {t("* Please use this code if you want to embed your story into a webpage")}
            </Text>
          </div>
        </Section>
      ) : publishing !== "unpublishing" ? (
        <>
          <Section>
            <Text size="body">{updateDescriptionText}</Text>
            {url && alias && (
              <PublishLink href={purl} target="blank">
                <UrlText size="body" color={theme.classic.main.accent}>
                  {purl}
                </UrlText>
              </PublishLink>
            )}
          </Section>
          <OptionsToggle onClick={() => setOptions(!showOptions)}>
            <Text size="footnote">{t("more options")}</Text>
            <ArrowIcon icon="arrowToggle" size={16} open={showOptions} />
          </OptionsToggle>
          <HideableSection showOptions={showOptions}>
            <ToggleField
              name={t("Search engine indexing")}
              description={t("Page will be available as result on search engines")}
              checked={searchIndex}
              onChange={handleSearchIndexChange}
            />
          </HideableSection>
        </>
      ) : (
        <Section>
          <StyledIcon icon="alert" color={theme.classic.main.warning} />
          <Subtitle size="body">{t("Your story will be unpublished.")}</Subtitle>
          <Subtitle size="body">
            {t("This means that anybody with the URL will become unable to view this story.")}
          </Subtitle>
          <Text size="body" color={theme.classic.main.warning}>
            {t("**Warning**: This includes websites where this story is embedded.")}
          </Text>
        </Section>
      )}
    </Modal>
  );
};

export default PublishStoryModal;
