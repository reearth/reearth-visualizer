import React, { useMemo } from "react";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import { Status } from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { publishingType } from "@reearth/components/molecules/EarthEditor/Header/index";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks from "./hooks";
import InputField from "./InputField";

interface Props {
  className?: string;
  loading?: boolean;
  isVisible: boolean;
  publicationStatus?: Status;
  projectId?: string;
  projectAlias?: string;
  validAlias?: boolean;
  onClose?: () => void;
  onSearchIndexChange?: () => void;
  searchIndex?: boolean;
  publishing?: publishingType;
  onPublish?: (alias: string | undefined, publicationStatus: Status) => void | Promise<void>;
  onCopyToClipBoard?: () => void;
  onAliasValidate?: (alias: string) => void;
  validatingAlias?: boolean;
  url?: string[];
}

const PublicationModal: React.FC<Props> = ({
  isVisible,
  loading,
  onClose,
  onSearchIndexChange,
  searchIndex,
  publishing,
  publicationStatus,
  onPublish,
  projectAlias,
  onCopyToClipBoard,
  validAlias,
  onAliasValidate,
  validatingAlias,
  url,
}) => {
  const t = useT();
  const theme = useTheme();
  const {
    handlePublish,
    handleClose,
    statusChanged,
    alias,
    validation,
    copiedKey,
    handleCopyToClipBoard,
    showOptions,
    setOptions,
  } = useHooks(
    publishing,
    projectAlias,
    searchIndex,
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
  const publishDisabled =
    loading ||
    (publishing === "unpublishing" && publicationStatus === "unpublished") ||
    ((publishing === "publishing" || publishing === "updating") &&
      (!alias || !!validation || validatingAlias || !validAlias));

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
      title={modalTitleText}
      size="sm"
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        statusChanged === false && (
          <Button
            text={primaryButtonText}
            buttonType="primary"
            disabled={publishDisabled}
            onClick={handlePublish}
          />
        )
      }
      button2={
        !statusChanged ? (
          <Button text={t("Cancel")} buttonType="secondary" onClick={handleClose} />
        ) : (
          <Button text={t("Close")} buttonType="secondary" onClick={handleClose} />
        )
      }>
      {statusChanged ? (
        <Section>
          <Subtitle size="m">{t("Your project has been published!")}</Subtitle>
          <Subtitle size="m">{t("Public URL")}</Subtitle>
          <InputField
            button1={t("Copy")}
            value={purl}
            actioned={copiedKey?.url}
            onButtonClick1={handleCopyToClipBoard("url", purl)}
            link
            subMessage={t("* Anyone can see your project with this URL")}
          />
          <Subtitle size="m">{t("Embed Code")}</Subtitle>
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
            <Divider margin="20px" />
            <Text size="m">{updateDescriptionText}</Text>
            {url && alias && (
              <PublishLink href={purl} target="blank">
                <UrlText size="m" color={theme.main.accent}>
                  {purl}
                </UrlText>
              </PublishLink>
            )}
            <Divider margin="0" />
          </Section>
          <OptionsToggle onClick={() => setOptions(!showOptions)}>
            <ArrowIcon icon="arrowToggle" size={16} open={showOptions} />
            <Text size="s">{t("more options")}</Text>
          </OptionsToggle>
          <HideableSection showOptions={showOptions}>
            <Flex>
              <Subtitle size="m">{t("Search engine indexing")}</Subtitle>
              <ToggleButton checked={searchIndex} onChange={onSearchIndexChange} />
            </Flex>
          </HideableSection>
        </>
      ) : (
        <Section>
          <StyledIcon icon="alert" color={theme.main.warning} />
          <Subtitle size="m">{t("Your project will be unpublished.")}</Subtitle>
          <Subtitle size="m">
            {t("This means that anybody with the URL will become unable to view this project.")}
          </Subtitle>
          <Text size="m" color={theme.main.warning}>
            {t("**Warning**: This includes websites where this project is embedded.")}
          </Text>
        </Section>
      )}
    </Modal>
  );
};

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

type SectionType = { disabled?: boolean };
const Section = styled.div<SectionType>`
  margin-bottom: ${`${metricsSizes["m"]}px`};
  opacity: ${({ disabled }) => disabled && "0.6"};
  cursor: ${({ disabled }) => disabled && "not-allowed"};
`;

const HideableSection = styled(Section)<{ showOptions?: boolean }>`
  display: ${props => (props.showOptions ? null : "none")};
`;

const Subtitle = styled(Text)`
  text-align: left;
  margin-bottom: ${`${metricsSizes["2xl"]}px`};
`;

const StyledIcon = styled(Icon)`
  margin-bottom: ${`${metricsSizes["2xl"]}px`};
`;

const UrlText = styled(Text)`
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: ${`${metricsSizes["2xl"]}px 0`};
`;

const PublishLink = styled.a`
  text-decoration: none;
`;

const OptionsToggle = styled.div`
  display: flex;
  align-items: center;
  margin: ${`0 0 ${metricsSizes["m"]}px 0`};
  color: ${({ theme }) => theme.main.text};
  cursor: pointer;
  user-select: none;
`;

const ArrowIcon = styled(Icon)<{ open?: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
`;

export default PublicationModal;
