import React from "react";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import AssetCard from "@reearth/components/molecules/Common/AssetModal/AssetCard";
import AssetListItem from "@reearth/components/molecules/Common/AssetModal/AssetListItem";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import useHooks, { GoogleSheet, SheetParameter as SheetParam } from "./hooks";

export type SheetParameter = SheetParam;

export type Props = {
  onReturn: () => void;
  onSheetSelect: (sheet: SheetParam) => void;
  syncLoading: boolean;
};

const Gdrive: React.FC<Props> = ({ onReturn, syncLoading, onSheetSelect }) => {
  const t = useT();
  const theme = useTheme();

  const {
    isLoading,
    pickedFile,
    pickedFileSheets,
    selectedSheet,
    handleAuthClick,
    handleSheetSelect,
  } = useHooks(onSheetSelect);

  return (
    <>
      <StyledIcon icon={"arrowLongLeft"} size={24} onClick={onReturn} color={theme.main.text} />
      {syncLoading && <Loading />}
      <Flex justify="center" direction="column" align="center">
        <Flex justify="center" align="center">
          <GdriveIcon size={32} icon="googleDrive" />
          <Text size="m" color={theme.main.strongText} weight="bold">
            {t("Connect with Google Drive")}
          </Text>
        </Flex>
        <Divider margin="24px" />
        {pickedFile?.id && (
          <>
            <AssetCard
              name={pickedFile.name}
              cardSize="medium"
              icon="sheetFile"
              iconSize="50px"
              onCheck={() => handleAuthClick()}
            />
            <Divider />
            <AssetWrapper direction="column" justify="space-between">
              <AssetList wrap="nowrap" direction="column" justify="space-between">
                {pickedFileSheets?.map((sheetItem: GoogleSheet) => (
                  <AssetListItem
                    key={sheetItem.properties.sheetId}
                    asset={{ id: sheetItem.properties.sheetId, name: sheetItem.properties.title }}
                    onCheck={() => {
                      handleSheetSelect({
                        id: sheetItem.properties.sheetId,
                        name: sheetItem.properties.title,
                      });
                    }}
                    selected={sheetItem.properties.sheetId === selectedSheet?.id}
                  />
                ))}
              </AssetList>
            </AssetWrapper>
            <Divider />
          </>
        )}

        {!pickedFile?.id && (
          <>
            <Text
              size="m"
              color={theme.infoBox.weakText}
              otherProperties={{ marginBottom: metricsSizes["m"] + "px" }}>
              {t("Re:Earth supports uploading Google Sheets and CSV files.")}
            </Text>

            {isLoading ? (
              <Loading />
            ) : (
              <Button
                large
                text="Connect your google account"
                buttonType="primary"
                onClick={() => handleAuthClick()}
              />
            )}
          </>
        )}
      </Flex>
    </>
  );
};

const GdriveIcon = styled(Icon)`
  margin-right: ${metricsSizes["m"]}px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const AssetList = styled(Flex)`
  width: 100%;
  max-height: 196px;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &::after {
    content: "";
    flex: "0 33%";
  }

  * {
    margin: 4px 0;
  }
`;

const AssetWrapper = styled(Flex)`
  width: 100%;
`;

export default Gdrive;
