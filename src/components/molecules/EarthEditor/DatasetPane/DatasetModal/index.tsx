import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Card from "@reearth/components/atoms/Card";
import Divider from "@reearth/components/atoms/Divider";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import Gdrive from "./Gdrive";
import useHooks from "./hooks";

interface Props {
  className?: string;
  isVisible: boolean;
  syncLoading: boolean;
  onClose?: () => void;
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>;
  handleGoogleSheetDatasetAdd?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    schemeId: string | null,
  ) => Promise<void>;
}

const DatasetModal: React.FC<Props> = ({
  isVisible,
  syncLoading,
  onClose,
  handleDatasetAdd,
  handleGoogleSheetDatasetAdd,
}) => {
  const intl = useIntl();
  const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
  const {
    csv,
    dataType,
    disabled,
    onSelectCsvFile,
    onReturn,
    onSheetSelect,
    handleImport,
    handleClick,
    handleClose,
  } = useHooks(handleDatasetAdd, handleGoogleSheetDatasetAdd, onClose);

  const primaryButtonText = useMemo(() => {
    if (syncLoading) {
      return intl.formatMessage({ defaultMessage: "sending..." });
    } else {
      return intl.formatMessage({ defaultMessage: "Add Dataset" });
    }
  }, [syncLoading, intl]);
  const theme = useTheme();

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Add dataset" })}
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
      button2={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={handleClose}
          buttonType="secondary"
        />
      }>
      {!dataType ? (
        <ConnectSection>
          <Content>
            <Card
              id="csv"
              icon="computer"
              iconSize="50px"
              text={intl.formatMessage({ defaultMessage: "Upload from your device" })}
              subtext={intl.formatMessage({ defaultMessage: "Supports CSV, JSON, GIS files" })}
              margin={56}
              border="dashed"
              borderColor={theme.main.border}
              onClick={onSelectCsvFile}
            />
            {googleApiKey && (
              <Card
                id="gdrive"
                icon="googleDrive"
                iconSize="50px"
                text={intl.formatMessage({ defaultMessage: "Google Drive" })}
                margin={56}
                border="dashed"
                borderColor={theme.main.border}
                onClick={handleClick}
              />
            )}
          </Content>
        </ConnectSection>
      ) : (
        <InputSection>
          {dataType === "gdrive" && (
            <Gdrive onReturn={onReturn} onSheetSelect={onSheetSelect} syncLoading={syncLoading} />
          )}
          {dataType === "csv" && (
            <>
              <StyledIcon
                icon={"arrowLongLeft"}
                size={24}
                onClick={onReturn}
                color={theme.main.text}
              />
              <Subtitle
                size="m"
                color={theme.main.strongText}
                otherProperties={{ textAlign: "center" }}>
                {intl.formatMessage({ defaultMessage: "Upload CSV file" })}
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
          {!dataType && (
            <>
              <Button onClick={onReturn}>
                <Icon icon={"arrowLongLeft"} size={24} color={theme.main.text} />
              </Button>

              <Subtitle size="m" color={theme.main.strongText}>
                {intl.formatMessage({
                  defaultMessage: "Sorry, that service is unavailable at this time.",
                })}
              </Subtitle>
              <Divider margin="24px" />
            </>
          )}
        </InputSection>
      )}
    </Modal>
  );
};

const ConnectSection = styled.div`
  width: 100%;
  min-height: 200px;
  & > div > div {
    // margin-right: 40px;
    &:hover {
      cursor: pointer;
      background: ${props => props.theme.main.paleBg};
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
