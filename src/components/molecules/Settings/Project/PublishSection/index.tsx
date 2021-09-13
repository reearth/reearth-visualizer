import React, { useState, useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";
import { Status } from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import Field from "@reearth/components/molecules/Settings/Field";
import ChangeSiteNameModal from "@reearth/components/molecules/Settings/Project/ChangeSiteNameModal";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks from "./hooks";

interface Props {
  className?: string;
  loading?: boolean;
  projectAlias?: string;
  publicationStatus?: Status;
  validAlias?: boolean;
  onPublish?: (alias: string | undefined, publicationStatus: Status) => void | Promise<void>;
  onAliasValidate?: (alias: string) => void;
  validatingAlias?: boolean;
  onNotify?: (type: NotificationType, text: string) => void;
}

const PublishSection: React.FC<Props> = ({
  loading,
  projectAlias,
  publicationStatus,
  onPublish,
  validAlias,
  onAliasValidate,
  validatingAlias,
}) => {
  const url = window.REEARTH_CONFIG?.published?.split("{}");

  const [showDModal, setDModal] = useState(false);
  const intl = useIntl();
  const theme = useTheme();

  const { alias, onAliasChange, validation, handleCopyToClipBoard } = useHooks(
    projectAlias,
    onAliasValidate,
  );

  const purl = useMemo(() => {
    return (url?.[0] ?? "") + (projectAlias?.replace("/", "") ?? "") + (url?.[1] ?? "");
  }, [url, projectAlias]);

  const onDModalClose = useCallback(() => {
    onAliasChange(projectAlias);
    setDModal(false);
  }, [projectAlias, onAliasChange]);

  const handlePublish = useCallback(async () => {
    if (!publicationStatus) {
      setDModal(false);
      return;
    }
    await onPublish?.(alias, publicationStatus);
    setDModal(false);
  }, [alias, onPublish, publicationStatus]);

  const publishDisabled =
    loading ||
    publicationStatus === "unpublished" ||
    (publicationStatus === "published" &&
      (!alias || !!validation || validatingAlias || !validAlias));

  return (
    <>
      <Wrapper>
        <Section title={intl.formatMessage({ defaultMessage: "Site settings" })}>
          <StyledText size="m" color={theme.main.strongText}>
            {intl.formatMessage({ defaultMessage: "Site name" })}
          </StyledText>
          <Text size="s">
            {alias
              ? intl.formatMessage({
                  defaultMessage: "Access your project, copy or edit the URL below.",
                })
              : intl.formatMessage({
                  defaultMessage:
                    "Once your project is published from the editor page the URL details will be shown here.",
                })}
          </Text>
          {alias && (
            <StyledItem
              header={purl}
              action={<StyledIcon icon="edit" size={20} onClick={() => setDModal(true)} />}
              secondaryAction={
                <StyledIcon icon="copyCode" size={20} onClick={handleCopyToClipBoard(purl)} />
              }
            />
          )}
        </Section>
      </Wrapper>
      <ChangeSiteNameModal
        show={showDModal}
        onClose={onDModalClose}
        url={url}
        alias={alias}
        onAliasChange={onAliasChange}
        handlePublish={handlePublish}
        disabled={publishDisabled}
      />
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.lighterBg};
  position: relative;
`;

const StyledText = styled(Text)`
  margin-bottom: ${`${metricsSizes["m"]}px`};
`;

const StyledItem = styled(Field)`
  margin-top: ${metricsSizes["3xl"]}px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  color: ${props => props.theme.main.text};
  margin-left: ${`${metricsSizes["m"]}px`};

  &:hover {
    color: ${props => props.theme.main.strongText};
  }
`;

export default PublishSection;
