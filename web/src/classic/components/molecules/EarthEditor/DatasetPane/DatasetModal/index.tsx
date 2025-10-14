import React from "react";

import Button from "@reearth/classic/components/atoms/Button";
import Card from "@reearth/classic/components/atoms/Card";
import Divider from "@reearth/classic/components/atoms/Divider";
import Icon from "@reearth/classic/components/atoms/Icon";
import Loading from "@reearth/classic/components/atoms/Loading";
import Modal from "@reearth/classic/components/atoms/Modal";
import Text from "@reearth/classic/components/atoms/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import Gdrive from "./Gdrive";
import HostedCsvForm from "./HostedCsvForm";
import useHooks from "./hooks";

export type NotificationType = "error" | "warning" | "info" | "success";

interface Props {
  className?: string;
  isVisible: boolean;
  syncLoading: boolean;
  currentLang?: string;
  currentTheme?: string;
  onClose?: () => void;
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>;
  handleGoogleSheetDatasetAdd?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    schemeId: string | null,
  ) => Promise<void>;
  handleHostedDatasetAdd?: (
    url: string,
    auth: { type: string;[key: string]: any } | null,
    schemaId: string | null,
  ) => Promise<void>;
  onNotificationChange?: (type: NotificationType, text: string, heading?: string) => void;
}

const DatasetModal: React.FC<Props> = ({
  isVisible,
  syncLoading,
  currentLang,
  currentTheme,
  onClose,
  handleDatasetAdd,
  handleGoogleSheetDatasetAdd,
  handleHostedDatasetAdd,
  onNotificationChange,
}) => {
  const theme = useTheme();
  const t = useT();

  const {
    url,
    csv,
    dataType,
    disabled,
    accessToken,
    hostedUrl,
    authType,
    username,
    password,
    apiKey,
    primaryButtonText,
    googleApiKey,
    extensions,
    setUrl,
    setHostedUrl,
    setAuthType,
    setUsername,
    setPassword,
    setApiKey,
    handleSelectCsvFile,
    handleSetDataType,
    handleReturn,
    handleSheetSelect,
    handleImport,
    handleClose,
  } = useHooks(
    syncLoading,
    handleDatasetAdd,
    handleGoogleSheetDatasetAdd,
    handleHostedDatasetAdd,
    onClose,
  );

  return (
    <Modal
      title={t("Add dataset")}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          large
          text={primaryButtonText}
          onClick={handleImport}
          disabled={disabled}
          buttonType="primary"
        />
      }
      button2={<Button large text={t("Cancel")} onClick={handleClose} buttonType="secondary" />}>
      {!dataType ? (
        <ConnectSection>
          <Content>
            <Card
              id="csv"
              icon="computer"
              iconSize="50px"
              text={t("Upload from your device")}
              subtext={t("Supports CSV, JSON, GIS files")}
              margin={56}
              border="dashed"
              borderColor={theme.classic.main.border}
              onClick={handleSelectCsvFile}
            />
            {googleApiKey && (
              <Card
                id="gdrive"
                icon="googleDrive"
                iconSize="50px"
                text={t("Google Drive")}
                margin={56}
                border="dashed"
                borderColor={theme.classic.main.border}
                onClick={() => handleSetDataType("gdrive")}
              />
            )}
            <Card
              id="hosted"
              icon="link"
              iconSize="50px"
              text={t("Hosted CSV")}
              subtext={t("From URL (Google Sheets, GitHub, etc.)")}
              margin={56}
              border="dashed"
              borderColor={theme.classic.main.border}
              onClick={() => handleSetDataType("hosted")}
            />
            {extensions?.map(ext => (
              <Card
                key={ext.id}
                id={ext.id}
                icon={ext.image}
                iconSize="80px"
                text={ext.title}
                margin={56}
                border="dashed"
                borderColor={theme.classic.main.border}
                onClick={() => handleSetDataType(ext.id)}
              />
            ))}
          </Content>
        </ConnectSection>
      ) : (
        <InputSection>
          {dataType === "gdrive" && (
            <Gdrive
              onReturn={handleReturn}
              onSheetSelect={handleSheetSelect}
              syncLoading={syncLoading}
            />
          )}
          {dataType === "csv" && (
            <>
              <StyledIcon
                icon={"arrowLongLeft"}
                size={24}
                onClick={handleReturn}
                color={theme.classic.main.text}
              />
              <Subtitle
                size="m"
                color={theme.classic.main.strongText}
                otherProperties={{ textAlign: "center" }}>
                {t("Upload CSV file")}
              </Subtitle>
              <Divider margin="24px" />
              <Content>
                {syncLoading ? (
                  <Loading />
                ) : (
                  csv && <Card id="csv" key="csv" icon="file" iconSize="24px" text={csv.name} />
                )}
              </Content>
            </>
          )}
          {dataType === "hosted" && (
            <HostedCsvForm
              onReturn={handleReturn}
              onUrlChange={setHostedUrl}
              authType={authType}
              onAuthTypeChange={setAuthType}
              username={username}
              onUsernameChange={setUsername}
              password={password}
              onPasswordChange={setPassword}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              url={hostedUrl}
            />
          )}
          {extensions?.map(ext => (
            <ext.component
              key={ext.id}
              url={url}
              accessToken={accessToken}
              onReturn={handleReturn}
              onUrlChange={setUrl}
              onNotificationChange={onNotificationChange}
              theme={currentTheme}
              lang={currentLang}
            />
          ))}
        </InputSection>
      )}
    </Modal>
  );
};

const ConnectSection = styled.div`
  width: 100%;
  min-height: 200px;
  & > div > div {
    &:hover {
      cursor: pointer;
      background: ${props => props.theme.classic.main.paleBg};
    }
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
`;

const Subtitle = styled(Text)`
  flex: 1;
`;

const InputSection = styled.div`
  min-height: 296px;
  width: 100%;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

export default DatasetModal;