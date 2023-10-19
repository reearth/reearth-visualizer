import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import ToggleField from "@reearth/beta/components/fields/ToggleField";
import Icon from "@reearth/beta/components/Icon";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, metricsSizes, useTheme } from "@reearth/services/theme";

import useHooks, { type PublishStatus } from "./hooks";

export type publishingType = "publishing" | "updating" | "unpublishing";

type Props = {
  isVisible: boolean;
  className?: string;
  loading?: boolean;
  publishStatus?: PublishStatus;
  projectId?: string;
  projectAlias?: string;
  validAlias?: boolean;
  publishing?: publishingType;
  validatingAlias?: boolean;
  url?: string[];
  onPublish: (alias: string | undefined, publishStatus: PublishStatus) => void | Promise<void>;
  onClose?: () => void;
  onCopyToClipBoard?: () => void;
  onAliasValidate?: (alias: string) => void;
  onNavigateToSettings?: (page?: "story" | "public" | "asset" | "plugin" | undefined) => void;
};

const PublishModal: React.FC<Props> = ({
  isVisible,
  loading,
  publishing,
  publishStatus,
  projectAlias,
  validAlias,
  validatingAlias,
  url,
  onClose,
  onPublish,
  onCopyToClipBoard,
  onAliasValidate,
  onNavigateToSettings,
}) => {
  const t = useT();
  const theme = useTheme();

  const {
    statusChanged,
    alias,
    validation,
    showOptions,
    searchIndex,
    handlePublish,
    handleClose,
    handleCopyToClipBoard,
    handleSearchIndexChange,
    setOptions,
  } = useHooks(
    publishing,
    publishStatus,
    projectAlias,
    onPublish,
    onClose,
    onAliasValidate,
    onCopyToClipBoard,
  );

  const purl = useMemo(() => {
    return (url?.[0] ?? "") + (alias?.replace("/", "") ?? "") + (url?.[1] ?? "");
  }, [alias, url]);

  const embedCode = useMemo(
    () => `<iframe width="560" height="315" src="${purl}" frameBorder="0"></iframe>;`,
    [purl],
  );

  const publishDisabled = useMemo(
    () =>
      loading ||
      ((publishing === "publishing" || publishing === "updating") &&
        (!alias || !!validation || validatingAlias || !validAlias)),
    [alias, loading, publishing, validation, validAlias, validatingAlias],
  );

  const modalTitleText = useMemo(() => {
    return statusChanged
      ? t("Congratulations!")
      : publishing === "publishing"
      ? t("Publish your project")
      : publishing === "updating"
      ? t("Update your project")
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

  const secondaryButtonText = useMemo(() => (!statusChanged ? "Cancel" : "OK"), [statusChanged]);

  const updateDescriptionText = useMemo(() => {
    return publishing === "updating"
      ? t(
          "Your published project will be updated. This means all current changes will overwrite the current published project.",
        )
      : t(
          "Your project will be published. This means anybody with the below URL will be able to view this project.",
        );
  }, [t, publishing]);

  return (
    <Modal
      isVisible={isVisible}
      size="sm"
      title={modalTitleText}
      button1={
        <Button
          text={secondaryButtonText}
          buttonType={statusChanged ? "primary" : "secondary"}
          onClick={handleClose}
        />
      }
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
          <Subtitle size="body">{t("Your project has been published!")}</Subtitle>
          <Subtitle size="footnote">{t("Public URL")}</Subtitle>
          <div>
            <UrlWrapper justify="space-between">
              <Text
                size="body"
                weight="bold"
                color={theme.primary.main}
                onClick={() => window.open(purl, "_blank")}>
                {purl}
              </Text>
              <Text
                size="body"
                color={theme.primary.main}
                onClick={handleCopyToClipBoard("url", purl)}>
                {t("Copy")}
              </Text>
            </UrlWrapper>
            <Text size="footnote">{t("* Anyone can see your project with this URL")}</Text>
          </div>
          <Subtitle size="footnote">{t("Embed Code")}</Subtitle>
          <div>
            <UrlWrapper justify="space-between">
              <Text size="footnote">{embedCode}</Text>
              <Text
                size="body"
                color={theme.primary.main}
                onClick={handleCopyToClipBoard("embedCode", embedCode)}>
                {t("Copy")}
              </Text>
            </UrlWrapper>
            <Text size="xFootnote">
              {t("* Please use this code if you want to embed your project into a webpage")}
            </Text>
          </div>
        </Section>
      ) : publishing !== "unpublishing" ? (
        <>
          <Section>
            <Text size="body">{updateDescriptionText}</Text>
          </Section>
          <Section>
            <Text size="footnote">{t("Publish domain")}</Text>
            {url && alias && (
              <UrlWrapper onClick={() => window.open(purl, "_blank")}>
                <Text size="body" weight="bold" color={theme.primary.main}>
                  {purl}
                </Text>
              </UrlWrapper>
            )}
          </Section>
          <OptionsToggle onClick={() => setOptions(!showOptions)}>
            <Text size="footnote">{t("More options")}</Text>
            <ArrowIcon icon="arrowToggle" size={16} open={showOptions} />
          </OptionsToggle>
          <HideableSection showOptions={showOptions}>
            <div>
              <DomainText size="footnote">
                {t("Need to change domain related settings?")}
              </DomainText>
              <Button size="small" onClick={() => onNavigateToSettings?.("public")}>
                {t("Go to settings")}
              </Button>
            </div>
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
          <Header>
            <Icon icon="alert" />
            <Text size="h5" weight="bold">
              {t("Unpublishing")}
            </Text>
          </Header>
          <Subtitle size="body">{t("Your project will be unpublished.")}</Subtitle>
          <Subtitle size="body">
            {t("This means that anybody with the URL will become unable to view this project.")}
          </Subtitle>
          <Text size="body" color={theme.warning.main}>
            {t("**Warning**: This includes websites where this project is embedded.")}
          </Text>
        </Section>
      )}
    </Modal>
  );
};

export default PublishModal;

const Section = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${`${metricsSizes["m"]}px`};
  opacity: ${({ disabled }) => disabled && "0.6"};
  cursor: ${({ disabled }) => disabled && "not-allowed"};
`;

const Subtitle = styled(Text)`
  text-align: left;
`;

const UrlWrapper = styled.div<{ justify?: string }>`
  display: flex;
  justify-content: ${({ justify }) => justify ?? "center"};
  align-items: center;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
`;

const OptionsToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.content.main};
  cursor: pointer;
  user-select: none;
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) =>
    open ? "translateY(10%) rotate(90deg)" : "translateY(0) rotate(180deg)"};
`;

const HideableSection = styled(Section)<{ showOptions?: boolean }>`
  display: ${props => (props.showOptions ? null : "none")};
`;

const DomainText = styled(Text)`
  margin-bottom: 8px;
`;

const Header = styled.div`
  display: flex;
  gap: 12px;
  color: ${({ theme }) => theme.warning.main};
  margin-bottom: 12px;
`;
