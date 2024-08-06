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

import { usePublishPage } from "../../context";

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

  const { selectedProjectType } = usePublishPage();

  const projectTypeText = selectedProjectType === "story" ? "story" : "scene";

  const {
    statusChanged,
    alias,
    validation,
    handlePublish,
    handleClose,
    handleCopyToClipBoard,
    handleSearchIndexChange,
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
      ? t(`Publish your ${projectTypeText}`)
      : publishing === "updating"
      ? t(`Update your ${projectTypeText}`)
      : "";
  }, [t, statusChanged, publishing, projectTypeText]);

  const primaryButtonText = useMemo(() => {
    return statusChanged
      ? t("Ok")
      : publishing === "publishing"
      ? t("Publish")
      : publishing === "updating"
      ? t("Update")
      : t("Unpublish");
  }, [t, statusChanged, publishing]);

  const secondaryButtonText = useMemo(
    () => (!statusChanged ? t("Cancel") : t("Ok")),
    [t, statusChanged],
  );

  const updateDescriptionText = useMemo(() => {
    return publishing === "updating"
      ? t(
          `Your published ${projectTypeText} will be updated. This means all current changes will overwrite the current published ${projectTypeText}.`,
        )
      : t(
          `Your ${projectTypeText} will be published. This means anybody with the below URL will be able to view this ${projectTypeText}.`,
        );
  }, [t, publishing, projectTypeText]);

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

  const isPublishing = publishing !== "unpublishing";

  return (
    <Modal size="small" visible={isVisible}>
      <ModalPanel
        title={modalTitleText}
        actions={actions}
        onCancel={handleClose}
        darkGrayBgColor={true}
        showBorder={isPublishing}
        isHeader={isPublishing}>
        {statusChanged ? (
          <Section>
            <Subtitle size="body">{t(`Your ${projectTypeText} has been published!`)}</Subtitle>
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
                <UrlText>
                  <Typography
                    size="body"
                    color={theme.primary.main}
                    onClick={handleCopyToClipBoard("url", purl)}>
                    {t("Copy")}
                  </Typography>
                </UrlText>
              </UrlWrapper>
              <Typography size="footnote">
                {t(`* Anyone can see your ${projectTypeText} with this URL`)}
              </Typography>
            </div>
            <Subtitle size="footnote">{t("Embed Code")}</Subtitle>
            <div>
              <UrlWrapper justify="space-between">
                <Typography size="footnote">{embedCode}</Typography>
                <UrlText>
                  <Typography
                    size="body"
                    color={theme.primary.main}
                    onClick={handleCopyToClipBoard("embedCode", embedCode)}>
                    {t("Copy")}
                  </Typography>
                </UrlText>
              </UrlWrapper>
              <Typography size="footnote">
                {t(
                  `* Please use this code if you want to embed your ${projectTypeText} into a webpage`,
                )}
              </Typography>
            </div>
          </Section>
        ) : publishing !== "unpublishing" ? (
          <Section>
            <Typography size="body">{updateDescriptionText}</Typography>
            <DomainWrapper>
              <Typography size="footnote">{t("Publish domain")}</Typography>
              {url && alias && (
                <UrlWrapper onClick={() => window.open(purl, "_blank")}>
                  <Typography size="body" weight="bold" color={theme.primary.main}>
                    {purl}
                  </Typography>
                </UrlWrapper>
              )}
            </DomainWrapper>
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
          </Section>
        ) : (
          <Section>
            <Header>
              <WarningIcon icon="warning" />
            </Header>
            <Subtitle size="body">{t(`Your ${projectTypeText} will be unpublished.`)}</Subtitle>
            <Subtitle size="body">
              {t(
                `This means that anybody with the URL will become unable to view this ${projectTypeText}. This includes websites where this ${projectTypeText} is embedded.`,
              )}
            </Subtitle>
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
  padding: theme.spacing.normal,
  gap: theme.spacing.large,
  opacity: disabled ? 0.6 : 1,
  cursor: disabled ? "not-allowed" : "auto",
}));

const Subtitle = styled(Typography)({
  textAlign: "left",
});

const DomainWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
}));

const UrlWrapper = styled("div")<{ justify?: string }>(({ justify, theme }) => ({
  display: "flex",
  justifyContent: justify ?? "center",
  alignItems: "center",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "4px",
  padding: `${theme.spacing.small}px ${theme.spacing.large}px`,
  cursor: "pointer",
}));

const UrlText = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  whiteSpace: "nowrap",
});

const DomainText = styled("div")(({ theme }) => ({
  marginBottom: `${theme.spacing.small}px`,
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  color: theme.warning.main,
}));

const WarningIcon = styled(Icon)({
  width: "24px",
  height: "24px",
});
