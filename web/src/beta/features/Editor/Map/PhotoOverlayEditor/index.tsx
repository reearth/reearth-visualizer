import { Button, Panel } from "@reearth/beta/lib/reearth-ui";
import {
  AssetField,
  CameraField,
  RadioGroupField,
  SliderField,
  TextareaField
} from "@reearth/beta/ui/fields";
import {
  generateNewPropertiesWithPhotoOverlay,
  getPhotoOverlayValue,
  PhotoOverlayValue
} from "@reearth/beta/utils/sketch";
import { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { FC, useCallback, useMemo, useState } from "react";

import { useMapPage } from "../context";
import { photoOverlayEditingFeatureAtom } from "../state";

const DEFAULT_PHOTO_SIZE_TYPE = "contain";

const PhotoOverlayEditor: FC = () => {
  const t = useT();

  const [feature, setFeature] = useAtom(photoOverlayEditingFeatureAtom);

  const { handleGeoJsonFeatureUpdate } = useMapPage();

  const handleCancel = useCallback(() => {
    setFeature(RESET);
  }, [setFeature]);

  const photoSizeTypeOptions = useMemo(
    () => [
      { value: "contain", label: t("Contain") },
      { value: "fixedWidthPct", label: t("Fixed") }
    ],
    [t]
  );

  const [photoTransparency, setPhotoTransparency] = useState(1);
  const [value, setValue] = useState<PhotoOverlayValue | undefined>(
    getPhotoOverlayValue(feature?.feature.properties)
  );

  const handlePhotoUrlChange = useCallback((url: string | undefined) => {
    setValue((prev) => ({ ...prev, url }));
  }, []);

  const handlePhotoSizeTypeChange = useCallback((fill: string) => {
    if (!fill || !["contain", "fixedWidthPct"].includes(fill)) return;
    const fillValue = fill as "contain" | "fixedWidthPct";
    setValue((prev) => ({ ...prev, fill: fillValue }));
  }, []);

  const handlePhotoDescriptionChange = useCallback(
    (description: string | undefined) => {
      setValue((prev) => ({ ...prev, description }));
    },
    []
  );

  const handleCameraChange = useCallback(
    (camera: Camera | undefined) => setValue((prev) => ({ ...prev, camera })),
    []
  );

  const handleSave = useCallback(() => {
    if (!feature || !value) return;
    handleGeoJsonFeatureUpdate?.({
      layerId: feature.layerId,
      featureId: feature.dataFeatureId,
      geometry: feature.feature.geometry,
      properties: generateNewPropertiesWithPhotoOverlay(
        feature.feature.properties,
        value
      )
    });
  }, [feature, handleGeoJsonFeatureUpdate, value]);

  return (
    <Wrapper>
      <InteractiveWrapper>
        <Panel width={233}>
          <FieldsWrapper>
            <SliderField
              title={t("Photo transparency")}
              value={photoTransparency}
              min={0}
              max={1}
              onChange={setPhotoTransparency}
            />
          </FieldsWrapper>
        </Panel>
      </InteractiveWrapper>
      <InteractiveWrapper>
        <Panel
          width={270}
          title={t("PhotoOverlay settings")}
          onCancel={handleCancel}
          actions={
            <ActionWrapper>
              <Button title={t("Cancel")} extendWidth onClick={handleCancel} />
              <Button
                title={t("Submit")}
                extendWidth
                onClick={handleSave}
                disabled={!value}
              />
            </ActionWrapper>
          }
        >
          <FieldsWrapper>
            <AssetField
              title={t("Photo")}
              value={value?.url}
              onChange={handlePhotoUrlChange}
              inputMethod="asset"
            />
            <RadioGroupField
              title={t("Photo size type")}
              value={value?.fill ?? DEFAULT_PHOTO_SIZE_TYPE}
              options={photoSizeTypeOptions}
              onChange={handlePhotoSizeTypeChange}
            />
            <TextareaField
              title={t("Photo description")}
              value={value?.description}
              rows={3}
              onChange={handlePhotoDescriptionChange}
            />
          </FieldsWrapper>
          <Divider />
          <FieldsWrapper>
            <CameraField
              title={t("Camera")}
              value={value?.camera}
              onSave={handleCameraChange}
            />
          </FieldsWrapper>
        </Panel>
      </InteractiveWrapper>
    </Wrapper>
  );
};

export default PhotoOverlayEditor;

const Wrapper = styled("div")(({ theme }) => ({
  position: "absolute",
  top: theme.spacing.small,
  right: theme.spacing.small,
  zIndex: theme.zIndexes.editor.overlay,
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));

const InteractiveWrapper = styled("div")(() => ({
  pointerEvents: "all"
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.small
}));

const Divider = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weak}`
}));

const ActionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small
}));
