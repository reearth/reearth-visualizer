import { useMemo, FC } from "react";

import {
  Button,
  Icon,
  Typography,
  ModalPanel,
  Modal,
} from "@reearth/beta/lib/reearth-ui/components";
import { SwitchField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import spacingSizes from "@reearth/services/theme/reearthTheme/common/spacing";

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

const PublishModal: FC<Props> = ({
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

  const actions = useMemo(
    () => (
      <>
        <Button
          title={secondaryButtonText}
          appearance={statusChanged ? "primary" : "secondary"}
          onClick={handleClose}
        />
        {!statusChanged && (
          <Button
            title={primaryButtonText}
            appearance="primary"
            disabled={publishDisabled}
            onClick={handlePublish}
          />
        )}
      </>
    ),
    [
      handleClose,
      handlePublish,
      publishDisabled,
      primaryButtonText,
      secondaryButtonText,
      statusChanged,
    ],
  );

  const isHeader = publishing !== "unpublishing";

  return (
    <Modal size="small" visible={isVisible}>
      <ModalPanel
        title={modalTitleText}
        actions={actions}
        onCancel={handleClose}
        isHeader={isHeader}>
        {statusChanged ? (
          <Section>
            <Subtitle size="body">{t("Your project has been published!")}</Subtitle>
            <Subtitle size="footnote">{t("Public URL")}</Subtitle>
            <div>
              <UrlWrapper justify="space-between">
                <Typography
                  size="body"
                  weight="bold"
                  color={theme.primary.main}
                  onClick={() => window.open(purl, "_blank")}>
                  {purl}
                </Typography>
                <Typography
                  size="body"
                  color={theme.primary.main}
                  onClick={handleCopyToClipBoard("url", purl)}>
                  {t("Copy")}
                </Typography>
              </UrlWrapper>
              <Typography size="footnote">
                {t("* Anyone can see your project with this URL")}
              </Typography>
            </div>
            <Subtitle size="footnote">{t("Embed Code")}</Subtitle>
            <div>
              <UrlWrapper justify="space-between">
                <Typography size="footnote">{embedCode}</Typography>
                <Typography
                  size="body"
                  color={theme.primary.main}
                  onClick={handleCopyToClipBoard("embedCode", embedCode)}>
                  {t("Copy")}
                </Typography>
              </UrlWrapper>
              <Typography size="footnote">
                {t("* Please use this code if you want to embed your project into a webpage")}
              </Typography>
            </div>
          </Section>
        ) : publishing !== "unpublishing" ? (
          <>
            <Section>
              <Typography size="body">{updateDescriptionText}</Typography>
            </Section>
            <Section>
              <Typography size="footnote">{t("Publish domain")}</Typography>
              {url && alias && (
                <UrlWrapper onClick={() => window.open(purl, "_blank")}>
                  <Typography size="body" weight="bold" color={theme.primary.main}>
                    {purl}
                  </Typography>
                </UrlWrapper>
              )}
            </Section>
            <OptionsToggle onClick={() => setOptions(!showOptions)}>
              <Typography size="footnote">{t("More options")}</Typography>
              <ArrowIcon icon="triangle" size="small" open={showOptions} />
            </OptionsToggle>
            <HideableSection showOptions={showOptions}>
              <div>
                <DomainText>
                  <Typography size="footnote">
                    {t("Need to change domain related settings?")}
                  </Typography>
                </DomainText>
                <Button
                  size="small"
                  onClick={() => onNavigateToSettings?.("public")}
                  title={t("Go to settings")}
                />
              </div>
              <SwitchField
                commonTitle={t("Search engine indexing")}
                description={t("Page will be available as result on search engines")}
                onChange={handleSearchIndexChange}
              />
            </HideableSection>
          </>
        ) : (
          <Section>
            <Header>
              <WarningIcon icon="warning" />
              <Typography size="h5" weight="bold">
                {t("Unpublishing")}
              </Typography>
            </Header>
            <Subtitle size="body">{t("Your project will be unpublished.")}</Subtitle>
            <Subtitle size="body">
              {t("This means that anybody with the URL will become unable to view this project.")}
            </Subtitle>
            <Typography size="body" color={theme.warning.main}>
              {t("**Warning**: This includes websites where this project is embedded.")}
            </Typography>
          </Section>
        )}
      </ModalPanel>
    </Modal>
  );
};

export default PublishModal;

const Section = styled("div")<{ disabled?: boolean }>(({ disabled, theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.super,
  gap: theme.spacing.small,
  marginBottom: `${spacingSizes["normal"]}px`,
  opacity: disabled ? 0.6 : 1,
  cursor: disabled ? "not-allowed" : "auto",
}));

const Subtitle = styled(Typography)({
  textAlign: "left",
});

const UrlWrapper = styled("div")<{ justify?: string }>(({ justify, theme }) => ({
  display: "flex",
  justifyContent: justify ?? "center",
  alignItems: "center",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "4px",
  padding: `${theme.spacing.small}px ${theme.spacing.large}px`,
  cursor: "pointer",
}));

const OptionsToggle = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${theme.spacing.small}px ${theme.spacing.large}px`,
  color: theme.content.main,
  cursor: "pointer",
  userSelect: "none",
}));

const ArrowIcon = styled(Icon)<{ open?: boolean }>(({ open }) => ({
  transition: "transform 0.15s ease",
  transform: open ? "translateY(10%) rotate(270deg)" : "translateY(0) rotate(0deg)",
}));

const HideableSection = styled(Section)<{ showOptions?: boolean }>(({ showOptions }) => ({
  display: showOptions ? "flex" : "none",
}));

const DomainText = styled("div")(({ theme }) => ({
  marginBottom: `${theme.spacing.small}px`,
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  gap: "12px",
  color: theme.warning.main,
  marginBottom: "12px",
}));

const WarningIcon = styled(Icon)({
  width: "24px",
  height: "24px",
});
