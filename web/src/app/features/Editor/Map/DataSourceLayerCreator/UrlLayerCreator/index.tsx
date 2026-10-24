import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import {
  InputGroup,
  LayerNameList,
  LayerNameListWrapper,
  LayerWrapper
} from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Selector,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";
import { ClipLoader } from "react-spinners";

import CsvColumnInputs from "../CsvColumnInputs";
import InfoLayerTips from "../InfoLayerTips";


import useHooks from "./hooks";

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const UrlLayerCreator: FC<Props> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  const theme = useTheme();

  const {
    url,
    format,
    formatOptions,
    latColumn,
    lngColumn,
    layerNameList,
    layerName,
    isLayerName,
    checking,
    error,
    canSubmit,
    prioritizePerformance,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    autoUpdateTime,
    setAutoUpdateTime,
    handleUrlChange,
    handleUrlBlur,
    handleFormatChange,
    setLayerName,
    handleBlur,
    handleLayerNameButtonClick,
    handleLayerNameDelete,
    handleSubmit
  } = useHooks({ sceneId, onClose, onSubmit });

  // CSV's note comes with its column inputs (CsvColumnInputs).
  const warning =
    format === "czml"
      ? t(
          "The development of the CZML format is still in the experimental stage and not very stable. Additionally, some features are not fully supported yet, so please use it with caution."
        )
      : format === "kml"
        ? t(
            "The development of the KML format is still in the experimental stage and not very stable. Additionally, some features are not fully supported yet, so please use it with caution."
          )
        : undefined;

  return (
    <Modal size="medium" visible dataTestid="url-layer-creator-modal">
      <ModalPanel
        icon="linkSimpleHorizontal"
        title={t("Add from URL")}
        onCancel={onClose}
        withBackground
        actions={
          <ActionWrapper>
            {format === "geojson" && (
              <InfoLayerTips
                label={t("Prioritize Performance")}
                description={t(
                  "If Prioritize Performance is set to True, the Visualizer will prioritize performance. This layer will not use the Layer Style but instead will apply its own predefined style, which cannot be modified."
                )}
                value={prioritizePerformance}
                onChange={setPrioritizePerformance}
                data-testid="url-layer-creator-prioritize"
                width={250}
              />
            )}
            {format === "czml" && (
              <InfoLayerTips
                label={t("Auto Update Time")}
                description={t(
                  "When enabled, the simulation clock will be updated to the time interval defined in the CZML file once it is loaded. Warning: If multiple CZML layers with this option enabled are loaded, the final simulation time will be set by the last loaded layer."
                )}
                value={autoUpdateTime}
                onChange={setAutoUpdateTime}
                data-testid="url-layer-creator-auto-update-time"
                width={250}
              />
            )}
            <Button
              title={t("Cancel")}
              onClick={onClose}
              data-testid="url-layer-creator-cancel"
            />
            <Button
              title={t("Add")}
              appearance="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
              data-testid="url-layer-creator-submit"
            />
          </ActionWrapper>
        }
      >
        <Content aria-busy={checking}>
          <Intro>
            {t(
              "Add a layer from data hosted on the web. The URL must be publicly accessible and allow cross-origin requests."
            )}
          </Intro>
          <InputGroup
            label={t("URL")}
            description={
              error
                ? undefined
                : t("Supports GeoJSON, CSV, CZML, KML, 3D Tiles, MVT and WMS.")
            }
          >
            <TextInput
              extendWidth
              placeholder="https://"
              value={url}
              error={!!error}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              dataTestid="url-layer-creator-url"
            />
            {error && (
              <ErrorText data-testid="url-layer-creator-error">
                {error}
              </ErrorText>
            )}
          </InputGroup>
          <Selector
            value={format}
            options={formatOptions}
            placeholder={t("Select format")}
            onChange={handleFormatChange}
            dataTestid="url-layer-creator-format"
          />

          {format === "csv" && (
            <CsvColumnInputs
              latColumn={latColumn}
              lngColumn={lngColumn}
              onLatColumnChange={setLatColumn}
              onLngColumnChange={setLngColumn}
              testIdPrefix="url-layer-creator"
            />
          )}

          {(format === "mvt" || format === "wms") && (
            <InputGroup
              label={t("Choose layer to add")}
              data-testid="vectortiles-layer-group"
            >
              <LayerNameListWrapper data-testid="vectortiles-layer-list-wrapper">
                <LayerNameList data-testid="vectortiles-layer-list">
                  {layerNameList.map((layer: string, index: number) => (
                    <LayerWrapper
                      key={index}
                      data-testid={`vectortiles-layer-item-${index}`}
                    >
                      <TextInput
                        value={`${layer}`}
                        extendWidth
                        data-testid={`vectortiles-layer-textinput-${index}`}
                      />
                      <Button
                        icon="close"
                        iconButton
                        appearance="simple"
                        size="small"
                        iconColor={theme.content.main}
                        onClick={() => handleLayerNameDelete(index)}
                        data-testid={`vectortiles-layer-delete-button-${index}`}
                      />
                    </LayerWrapper>
                  ))}
                  {(!layerNameList.length || isLayerName) && (
                    <LayerWrapper data-testid="vectortiles-layer-input-wrapper">
                      <TextInput
                        placeholder={t("layer name")}
                        value={layerName}
                        extendWidth
                        onBlur={handleBlur}
                        onChange={(value) => setLayerName(value)}
                        data-testid="vectortiles-layer-input"
                      />
                      <Button
                        icon="close"
                        iconButton
                        iconColor={theme.content.weak}
                        size="small"
                        appearance="simple"
                        disabled
                        data-testid="vectortiles-layer-input-disabled-button"
                      />
                    </LayerWrapper>
                  )}
                </LayerNameList>
              </LayerNameListWrapper>

              <Button
                icon="plus"
                title={t("Layer name")}
                size="small"
                onClick={handleLayerNameButtonClick}
                data-testid="vectortiles-layer-add-button"
              />
            </InputGroup>
          )}

          {warning && (
            <Warning>
              <Icon icon="lightBulb" color={theme.warning.main} size="normal" />
              {warning}
            </Warning>
          )}
        </Content>
        {checking && (
          <Checking data-testid="url-layer-creator-checking">
            <ClipLoader size={24} color={theme.content.main} />
            {t("Checking the URL...")}
          </Checking>
        )}
      </ModalPanel>
    </Modal>
  );
};

const Content = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  ["& > *"]: {
    width: "100%",
    boxSizing: css.boxSizing.borderBox
  }
}));

const Intro = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body
}));

const ErrorText = styled("div")(({ theme }) => ({
  color: theme.dangerous.main,
  fontSize: theme.fonts.sizes.footnote
}));

const Warning = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.flexStart,
  color: theme.warning.main,
  fontSize: theme.fonts.sizes.body,
  ["& > svg"]: { flexShrink: 0 }
}));

// Covers the form (dimmed, not editable) while the URL's reachability is
// checked.
const Checking = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  inset: 0,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  gap: theme.spacing.small,
  background: theme.bg.transparentBlack,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  gap: theme.spacing.large,
  alignItems: css.alignItems.center
}));

export default UrlLayerCreator;
