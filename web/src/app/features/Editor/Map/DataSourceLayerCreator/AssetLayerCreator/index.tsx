import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import {
  Button,
  Icon,
  IconButton,
  Modal,
  ModalPanel,
  Typography
} from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { keyframes, styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback } from "react";

import CsvColumnInputs from "../CsvColumnInputs";
import InfoLayerTips from "../InfoLayerTips";
import LayerNameInputs from "../LayerNameInputs";

import AssetContents from "./AssetContents";
import AssetTabs from "./AssetTabs";
import useHooks from "./hooks";
import UploadDropzone from "./UploadDropzone";
import UploadList from "./UploadList";
import { FORMAT_LABELS, needsLayerNames } from "./utils";

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
    incomplete,
    upload,
    uploads,
    uploading,
    handleDropFiles,
    handleUploadRemove,
    handleUploadSubmit,
    wrapperRef,
    contentRef,
    layout,
    sort,
    sortOptions,
    formatFilter,
    formatOptions,
    isCmsTab,
    projectFilter,
    projectOptions,
    selectedId,
    selectedFormat,
    selectedAsset,
    step,
    latColumn,
    lngColumn,
    layerNameInputProps,
    prioritizePerformance,
    autoUpdateTime,
    canSubmit,
    checking,
    addError,
    dismissAddIssue,
    setLayout,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    setAutoUpdateTime,
    handleTabChange,
    handleSortChange,
    handleSearch,
    handleFormatFilterChange,
    handleProjectFilterChange,
    handleSelect,
    handleBack,
    handleSubmit
  } = useHooks({ sceneId, onClose, onSubmit });

  const [, setNotification] = useNotification();
  const handleCopyUrl = useCallback(async () => {
    if (!selectedAsset) return;
    try {
      await navigator.clipboard.writeText(selectedAsset.url);
      setNotification({
        type: "success",
        text: t("Asset URL copied to clipboard")
      });
    } catch {
      setNotification({
        type: "error",
        text: t("Could not copy the asset URL to the clipboard")
      });
    }
  }, [selectedAsset, setNotification, t]);

  return (
    <Modal width={880} visible dataTestid="asset-layer-creator-modal">
      <ModalPanel
        header={<AssetTabs value={tab} onChange={handleTabChange} />}
        onCancel={onClose}
        withBackground
        actions={
          <ActionWrapper>
            {step === "details" ? (
              <Button
                icon="arrowLongLeft"
                title={t("Back")}
                onClick={handleBack}
                data-testid="asset-layer-creator-back"
              />
            ) : (
              !isCmsTab && (
                <Typography size="footnote" color={theme.content.weak}>
                  {t("Supports GeoJSON, CSV, CZML and KML.")}
                </Typography>
              )
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
              {/* Where the selected CMS asset is served from. */}
              {step === "select" && isCmsTab && selectedAsset && (
                <HostedBy>
                  <HostedByLabel size="footnote" color={theme.content.weak}>
                    {t("Hosted by CMS")}
                  </HostedByLabel>
                  <UrlWrapper>
                    <Url title={selectedAsset.url}>{selectedAsset.url}</Url>
                    <IconButton
                      icon="copy"
                      size="small"
                      appearance="simple"
                      iconColor={theme.content.weak}
                      ariaLabel={t("Copy")}
                      onClick={handleCopyUrl}
                    />
                  </UrlWrapper>
                </HostedBy>
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
          <ContentWrapper dimmed={checking}>
            {step === "details" && selectedAsset && selectedFormat ? (
              <DetailsStep
                data-testid={
                  selectedFormat === "csv"
                    ? "asset-layer-creator-csv-columns"
                    : "asset-layer-creator-layer-names"
                }
              >
                <SelectedAsset>
                  <Badge>{FORMAT_LABELS[selectedFormat]}</Badge>
                  {needsLayerNames(selectedFormat) ? (
                    <AssetInfo>
                      <Typography size="footnote" color={theme.content.weak}>
                        {selectedAsset.projectName}
                        {selectedAsset.modelName && (
                          <>
                            {" / "}
                            <ModelLink
                              href={selectedAsset.modelUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {selectedAsset.modelName}
                            </ModelLink>
                          </>
                        )}
                      </Typography>
                      <UrlWrapper>
                        <Url title={selectedAsset.url}>{selectedAsset.url}</Url>
                        <IconButton
                          icon="copy"
                          size="small"
                          appearance="simple"
                          iconColor={theme.content.weak}
                          ariaLabel={t("Copy")}
                          onClick={handleCopyUrl}
                        />
                      </UrlWrapper>
                    </AssetInfo>
                  ) : (
                    <Typography size="body">{selectedAsset.name}</Typography>
                  )}
                </SelectedAsset>
                {selectedFormat === "csv" ? (
                  <CsvColumnInputs
                    latColumn={latColumn}
                    lngColumn={lngColumn}
                    onLatColumnChange={setLatColumn}
                    onLngColumnChange={setLngColumn}
                    testIdPrefix="asset-layer-creator"
                  />
                ) : (
                  <LayerNameInputs {...layerNameInputProps} />
                )}
              </DetailsStep>
            ) : (
              <UploadDropzone
                active={uploads.length > 0}
                onDrop={handleDropFiles}
                content={
                  <UploadList
                    uploads={uploads}
                    uploading={uploading}
                    onRemove={handleUploadRemove}
                    onSubmit={handleUploadSubmit}
                  />
                }
              >
                <AssetContents
                  assets={assets}
                  loading={loading}
                  incomplete={incomplete}
                  wrapperRef={wrapperRef}
                  contentRef={contentRef}
                  layout={layout}
                  formatFilter={formatFilter}
                  formatOptions={formatOptions}
                  tab={tab}
                  projectFilter={projectFilter}
                  projectOptions={projectOptions}
                  sort={sort}
                  sortOptions={sortOptions}
                  selectedId={selectedId}
                  onUpload={upload}
                  onLayoutChange={setLayout}
                  onSearch={handleSearch}
                  onFormatFilterChange={handleFormatFilterChange}
                  onProjectFilterChange={handleProjectFilterChange}
                  onSortChange={handleSortChange}
                  onSelect={handleSelect}
                />
              </UploadDropzone>
            )}
          </ContentWrapper>
          {checking && (
            <CheckWrapper data-testid="asset-layer-creator-checking">
              <Spinner aria-hidden>
                {SPOKES.map((i) => (
                  <Spoke key={i} index={i} />
                ))}
              </Spinner>
              {t("Checking the model")}
            </CheckWrapper>
          )}
          {addError && (
            <AddError role="alert" data-testid="asset-layer-creator-error">
              <Icon icon="warning" color={theme.dangerous.main} />
              <AddErrorText>
                <Typography size="body" weight="bold">
                  {addError.title}
                </Typography>
                <Typography size="footnote" color={theme.content.main}>
                  {addError.message}
                </Typography>
              </AddErrorText>
              <IconButton
                icon="close"
                size="small"
                appearance="simple"
                ariaLabel={t("Close")}
                onClick={dismissAddIssue}
              />
            </AddError>
          )}
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

const Wrapper = styled("div")(() => ({
  position: css.position.relative
}));

const ContentWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "dimmed"
})<{ dimmed: boolean }>(({ theme, dimmed }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  padding: theme.spacing.normal,
  opacity: dimmed ? 0.2 : 1,
  pointerEvents: dimmed ? "none" : undefined
}));

const CheckWrapper = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  inset: 0,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  gap: theme.spacing.small,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.h5,
  fontWeight: theme.fonts.weight.regular
}));

// Eight spokes fading in turn around the centre.
const SPOKES = [0, 1, 2, 3, 4, 5, 6, 7];

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0.2; }
`;

const Spinner = styled("div")(() => ({
  position: css.position.relative,
  width: 20,
  height: 20
}));

const Spoke = styled("span", {
  shouldForwardProp: (prop) => prop !== "index"
})<{ index: number }>(({ theme, index }) => ({
  position: css.position.absolute,
  left: 9,
  top: 0,
  width: 2,
  height: 6,
  borderRadius: 1,
  background: theme.content.main,
  transformOrigin: "1px 10px",
  transform: `rotate(${index * 45}deg)`,
  animation: `${fade} 0.8s linear infinite`,
  animationDelay: `${(index - SPOKES.length) * 0.1}s`
}));

// Over the assets, just above the footer.
const AddError = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  left: "50%",
  bottom: theme.spacing.large,
  transform: "translateX(-50%)",
  display: css.display.flex,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.small,
  width: 400,
  padding: theme.spacing.normal,
  borderRadius: theme.radius.normal,
  background: theme.bg[1],
  boxShadow: theme.shadow.tooltip
}));

const AddErrorText = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  flex: 1
}));

const DetailsStep = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.large,
  padding: theme.spacing.small,
  minHeight: 496
}));

const SelectedAsset = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small
}));

const AssetInfo = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  minWidth: 0
}));

const ModelLink = styled("a")(({ theme }) => ({
  color: theme.select.strong,
  textDecoration: "underline"
}));

// Capped, and the first to shrink, so a long URL is cut short instead of
// squeezing the other actions.
const HostedBy = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  minWidth: 0,
  maxWidth: 320,
  flexShrink: 100
}));

const UrlWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.micro,
  minWidth: 0
}));

const Url = styled("span")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.footnote,
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const HostedByLabel = styled(Typography)(() => ({
  whiteSpace: css.whiteSpace.nowrap,
  flexShrink: 0
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
  marginLeft: "auto",
  minWidth: 0
}));

export default AssetLayerCreator;
