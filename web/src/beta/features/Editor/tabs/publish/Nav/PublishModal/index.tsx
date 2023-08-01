import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Modal from "@reearth/beta/components/Modal";
import ToggleButton from "@reearth/beta/components/properties/Toggle";
import Text from "@reearth/beta/components/Text";
import InputField from "@reearth/classic/components/molecules/EarthEditor/PublicationModal/InputField";
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
  onPublish: (publishStatus: PublishStatus) => Promise<void>;
  onClose?: () => void;
  onCopyToClipBoard?: () => void;
  onAliasValidate?: (alias: string) => void;
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
}) => {
  const t = useT();
  const theme = useTheme();

  const {
    statusChanged,
    alias,
    validation,
    copiedKey,
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
      (publishing === "unpublishing" && publishStatus === "unpublished") ||
      ((publishing === "publishing" || publishing === "updating") &&
        (!alias || !!validation || validatingAlias || !validAlias)),
    [alias, loading, publishStatus, publishing, validation, validAlias, validatingAlias],
  );

  console.log("loading", loading);
  console.log("publishing", publishing);
  console.log("publishStatus", publishStatus);
  console.log("alias", alias);
  console.log("validation", validation);
  console.log("validatingAlias", validatingAlias);
  console.log("validAlias", validAlias);

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

  const secondaryButtonText = useMemo(() => (!statusChanged ? "Cancel" : "Close"), [statusChanged]);

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
      button1={<Button text={secondaryButtonText} buttonType="secondary" onClick={handleClose} />}
      button2={
        !statusChanged && (
          <Button text={primaryButtonText} disabled={publishDisabled} onClick={handlePublish} />
        )
      }
      onClose={handleClose}>
      {statusChanged ? (
        <Section>
          <Subtitle size="body">{t("Your project has been published!")}</Subtitle>
          <Subtitle size="body">{t("Public URL")}</Subtitle>
          <InputField
            button1={t("Copy")}
            value={purl}
            actioned={copiedKey?.url}
            onButtonClick1={handleCopyToClipBoard("url", purl)}
            link
            subMessage={t("* Anyone can see your project with this URL")}
          />
          <Subtitle size="body">{t("Embed Code")}</Subtitle>
          <InputField
            button1={t("Copy")}
            value={embedCode}
            actioned={copiedKey?.embedCode}
            onButtonClick1={handleCopyToClipBoard("embedCode", embedCode)}
            link
            subMessage={t(
              "* Please use this code if you want to embed your project into a webpage",
            )}
          />
        </Section>
      ) : publishing !== "unpublishing" ? (
        <>
          <Section>
            <Divider />
            <Text size="body">{updateDescriptionText}</Text>
            {url && alias && (
              <PublishLink href={purl} target="blank">
                <UrlText size="body" color={theme.classic.main.accent}>
                  {purl}
                </UrlText>
              </PublishLink>
            )}
            <Divider />
          </Section>
          <OptionsToggle onClick={() => setOptions(!showOptions)}>
            <ArrowIcon icon="arrowToggle" size={16} open={showOptions} />
            <Text size="footnote">{t("more options")}</Text>
          </OptionsToggle>
          <HideableSection showOptions={showOptions}>
            <Wrapper>
              <Subtitle size="body">{t("Search engine indexing")}</Subtitle>
              <ToggleButton checked={searchIndex} onChange={handleSearchIndexChange} />
            </Wrapper>
          </HideableSection>
        </>
      ) : (
        <Section>
          <StyledIcon icon="alert" color={theme.classic.main.warning} />
          <Subtitle size="body">{t("Your project will be unpublished.")}</Subtitle>
          <Subtitle size="body">
            {t("This means that anybody with the URL will become unable to view this project.")}
          </Subtitle>
          <Text size="body" color={theme.classic.main.warning}>
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

const StyledIcon = styled(Icon)`
  margin-bottom: ${`${metricsSizes["xl"]}px`};
`;

const PublishLink = styled.a`
  text-decoration: none;
`;

const OptionsToggle = styled.div`
  display: flex;
  align-items: center;
  margin: ${`0 0 ${metricsSizes["m"]}px 0`};
  color: ${({ theme }) => theme.classic.main.text};
  cursor: pointer;
  user-select: none;
`;

const Divider = styled.div`
  border-top: 1px solid black;
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
`;

const UrlText = styled(Text)`
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: ${`${metricsSizes["2xl"]}px 0`};
`;

const HideableSection = styled(Section)<{ showOptions?: boolean }>`
  display: ${props => (props.showOptions ? null : "none")};
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-content: center;
`;
