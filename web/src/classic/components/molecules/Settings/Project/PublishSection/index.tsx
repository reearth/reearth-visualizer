import React from "react";

import Divider from "@reearth/classic/components/atoms/Divider";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import Field from "@reearth/classic/components/molecules/Settings/Field";
import ChangeSiteNameModal from "@reearth/classic/components/molecules/Settings/Project/ChangeSiteNameModal";
import Section from "@reearth/classic/components/molecules/Settings/Section";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks, { Status } from "./hooks";

export type NotificationType = "error" | "warning" | "info" | "success";

interface Props {
  className?: string;
  projectId: string;
  loading?: boolean;
  projectAlias?: string;
  publicationStatus?: Status;
  validAlias?: boolean;
  validatingAlias?: boolean;
  currentLang?: string;
  currentTheme?: string;
  onPublish?: (alias: string | undefined, publicationStatus: Status) => void | Promise<void>;
  onAliasValidate?: (alias: string) => void;
  onNotificationChange?: (type: NotificationType, text: string, heading?: string) => void;
}

const PublishSection: React.FC<Props> = ({
  projectId,
  loading,
  projectAlias,
  publicationStatus,
  validAlias,
  validatingAlias,
  currentLang,
  currentTheme,
  onPublish,
  onAliasValidate,
  onNotificationChange,
}) => {
  const theme = useTheme();
  const t = useT();

  const {
    alias,
    extensions,
    accessToken,
    url,
    purl,
    showDModal,
    publishDisabled,
    handlePublish,
    handleDomainModalClose,
    setDModal,
    handleAliasChange,
    handleCopyToClipBoard,
  } = useHooks(
    projectAlias,
    loading,
    publicationStatus,
    validAlias,
    validatingAlias,
    onAliasValidate,
    onPublish,
  );

  return (
    <>
      <Wrapper>
        <Section title={t("Site settings")}>
          <StyledText size="m" color={theme.classic.main.strongText}>
            {t("Site name")}
          </StyledText>
          <Text size="s">
            {alias
              ? t("Access your project, copy or edit the URL below.")
              : t(
                  "Once your project is published from the editor page the URL details will be shown here.",
                )}
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
        {extensions && extensions.length > 0 && accessToken ? (
          <>
            <Divider margin="0" />
            {extensions.map(ext => (
              <ext.component
                key={ext.id}
                projectId={projectId}
                projectAlias={projectAlias}
                lang={currentLang}
                theme={currentTheme}
                accessToken={accessToken}
                onNotificationChange={onNotificationChange}
              />
            ))}
          </>
        ) : null}
      </Wrapper>
      <ChangeSiteNameModal
        show={showDModal}
        onClose={handleDomainModalClose}
        url={url}
        alias={alias}
        onAliasChange={handleAliasChange}
        handlePublish={handlePublish}
        disabled={publishDisabled}
      />
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.classic.main.lighterBg};
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
  color: ${props => props.theme.classic.main.text};
  margin-left: ${`${metricsSizes["m"]}px`};

  &:hover {
    color: ${props => props.theme.classic.main.strongText};
  }
`;

export default PublishSection;
