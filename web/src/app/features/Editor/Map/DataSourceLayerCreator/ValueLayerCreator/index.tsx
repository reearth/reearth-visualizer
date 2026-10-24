import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import { InputGroup } from "@reearth/app/features/Editor/Map/shared/SharedComponent";
import {
  Button,
  Icon,
  Modal,
  ModalPanel,
  Selector,
  TextArea
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import InfoLayerTips from "../InfoLayerTips";

import useHooks from "./hooks";

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

const ValueLayerCreator: FC<Props> = ({ sceneId, onClose, onSubmit }) => {
  const t = useT();
  const theme = useTheme();

  const {
    value,
    format,
    formatOptions,
    prioritizePerformance,
    error,
    canSubmit,
    setPrioritizePerformance,
    autoUpdateTime,
    setAutoUpdateTime,
    handleValueChange,
    handleValueBlur,
    handleFormatChange,
    handleSubmit
  } = useHooks({ sceneId, onClose, onSubmit });

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
    <Modal size="medium" visible dataTestid="value-layer-creator-modal">
      <ModalPanel
        icon="pencilSimple"
        title={t("Add from Value")}
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
                data-testid="value-layer-creator-prioritize"
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
                data-testid="value-layer-creator-auto-update-time"
                width={250}
              />
            )}
            <Button
              title={t("Cancel")}
              onClick={onClose}
              data-testid="value-layer-creator-cancel"
            />
            <Button
              title={t("Add")}
              appearance="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
              data-testid="value-layer-creator-submit"
            />
          </ActionWrapper>
        }
      >
        <Content>
          <Intro>
            {t(
              "Paste raw data in a supported format. The format is detected automatically, or you can select it manually."
            )}
          </Intro>
          <InputGroup
            label={t("Value")}
            description={error ? undefined : "GeoJSON, CZML, KML"}
          >
            <FullWidth>
              <TextArea
                value={value}
                placeholder={t("Paste data here")}
                rows={6}
                resizable="height"
                error={!!error}
                onChange={handleValueChange}
                onBlur={handleValueBlur}
                dataTestid="value-layer-creator-value"
              />
            </FullWidth>
            {error && (
              <ErrorText data-testid="value-layer-creator-error">
                {error}
              </ErrorText>
            )}
          </InputGroup>
          <Selector
            value={format}
            options={formatOptions}
            placeholder={t("Select format")}
            onChange={handleFormatChange}
            dataTestid="value-layer-creator-format"
          />
          {warning && (
            <Warning>
              <Icon icon="lightBulb" color={theme.warning.main} size="normal" />
              {warning}
            </Warning>
          )}
        </Content>
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

const FullWidth = styled("div")(() => ({
  width: "100%"
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

const ActionWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.row,
  gap: theme.spacing.large,
  alignItems: css.alignItems.center
}));

export default ValueLayerCreator;
