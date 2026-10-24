import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import {
  Button,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import CsvColumnInputs from "../CsvColumnInputs";
import InfoLayerTips from "../InfoLayerTips";

import AssetContents from "./AssetContents";
import AssetTabs from "./AssetTabs";
import useHooks from "./hooks";

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const AssetLayerCreator: FC<Props> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  const theme = useTheme();
  const {
    tab,
    assets,
    loading,
    upload,
    wrapperRef,
    contentRef,
    layout,
    sort,
    sortOptions,
    formatFilter,
    formatOptions,
    selectedId,
    selectedFormat,
    selectedAsset,
    step,
    latColumn,
    lngColumn,
    prioritizePerformance,
    autoUpdateTime,
    canSubmit,
    setLayout,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    setAutoUpdateTime,
    handleTabChange,
    handleSortChange,
    handleSearch,
    handleFormatFilterChange,
    handleSelect,
    handleBack,
    handleSubmit
  } = useHooks({ sceneId, onClose, onSubmit });

  return (
    <Modal width={880} visible dataTestid="asset-layer-creator-modal">
      <ModalPanel
        header={<AssetTabs value={tab} onChange={handleTabChange} />}
        onCancel={onClose}
        withBackground
        actions={
          <ActionWrapper>
            {step === "csvColumns" && (
              <Button
                icon="arrowLongLeft"
                title={t("Back")}
                onClick={handleBack}
                data-testid="asset-layer-creator-back"
              />
            )}
            <RightActions>
              {selectedFormat === "geojson" && (
                <InfoLayerTips
                  label={t("Prioritize Performance")}
                  description={t(
                    "If Prioritize Performance is set to True, the Visualizer will prioritize performance. This layer will not use the Layer Style but instead will apply its own predefined style, which cannot be modified."
                  )}
                  value={prioritizePerformance}
                  onChange={setPrioritizePerformance}
                  data-testid="asset-layer-creator-prioritize"
                  width={205}
                />
              )}
              {selectedFormat === "czml" && (
                <InfoLayerTips
                  label={t("Auto Update Time")}
                  description={t(
                    "When enabled, the simulation clock will be updated to the time interval defined in the CZML file once it is loaded. Warning: If multiple CZML layers with this option enabled are loaded, the final simulation time will be set by the last loaded layer."
                  )}
                  value={autoUpdateTime}
                  onChange={setAutoUpdateTime}
                  data-testid="asset-layer-creator-auto-update-time"
                  width={205}
                />
              )}
              {(selectedFormat === "kml" || selectedFormat === "czml") && (
                <Tooltip
                  type="custom"
                  icon="flask"
                  placement="bottom"
                  iconColor={theme.warning.main}
                  darkBackground
                  text={t(
                    "The development of the KML format is still in the experimental stage and not very stable. Additionally, some features are not fully supported yet, so please use it with caution."
                  )}
                  width={250}
                />
              )}
              <Button
                title={t("Cancel")}
                onClick={onClose}
                data-testid="asset-layer-creator-cancel"
              />
              <Button
                title={t("Add")}
                appearance="primary"
                disabled={!canSubmit}
                onClick={handleSubmit}
                data-testid="asset-layer-creator-submit"
              />
            </RightActions>
          </ActionWrapper>
        }
      >
        <Wrapper>
          {step === "csvColumns" && selectedAsset ? (
            <CsvStep data-testid="asset-layer-creator-csv-columns">
              <SelectedAsset>
                <Badge>CSV</Badge>
                <Typography size="body">{selectedAsset.name}</Typography>
              </SelectedAsset>
              <CsvColumnInputs
                latColumn={latColumn}
                lngColumn={lngColumn}
                onLatColumnChange={setLatColumn}
                onLngColumnChange={setLngColumn}
                testIdPrefix="asset-layer-creator"
              />
            </CsvStep>
          ) : (
            <AssetContents
              assets={assets}
              loading={loading}
              wrapperRef={wrapperRef}
              contentRef={contentRef}
              layout={layout}
              formatFilter={formatFilter}
              formatOptions={formatOptions}
              sort={sort}
              sortOptions={sortOptions}
              selectedId={selectedId}
              onUpload={upload}
              onLayoutChange={setLayout}
              onSearch={handleSearch}
              onFormatFilterChange={handleFormatFilterChange}
              onSortChange={handleSortChange}
              onSelect={handleSelect}
            />
          )}
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  padding: theme.spacing.large
}));

const CsvStep = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  minHeight: 496
}));

const SelectedAsset = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const Badge = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  width: 40,
  height: 40,
  borderRadius: theme.radius.small,
  background: theme.bg[2],
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold
}));

const ActionWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  flex: 1
}));

const RightActions = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.large,
  marginLeft: "auto"
}));

export default AssetLayerCreator;
