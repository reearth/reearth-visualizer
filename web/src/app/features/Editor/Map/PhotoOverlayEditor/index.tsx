import { IMAGE_TYPES } from "@reearth/app/features/AssetsManager/constants";
import { VISUALIZER_CORE_DOM_ID } from "@reearth/app/features/Visualizer/constaints";
import { Button, Panel } from "@reearth/app/lib/reearth-ui";
import {
  AssetField,
  CameraField,
  RadioGroupField,
  SliderField,
  TextareaField
} from "@reearth/app/ui/fields";
import { getImageDimensions } from "@reearth/app/utils/image";
import {
  generateNewPropertiesWithPhotoOverlay,
  getPhotoOverlayValue
} from "@reearth/app/utils/sketch";
import { Camera } from "@reearth/app/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";

import { useMapPage } from "../context";
import {
  photoOverlayEditingFeatureAtom,
  PhotoOverlayPreviewAtom
} from "../state";

const DEFAULT_PHOTO_SIZE_TYPE = "contain";

const PhotoOverlayEditor: FC = () => {
  const t = useT();

  const [feature, setFeature] = useAtom(photoOverlayEditingFeatureAtom);

  const { visualizerRef, handleGeoJsonFeatureUpdate, handleFlyTo } =
    useMapPage();

  const photoSizeTypeOptions = useMemo(
    () => [
      { value: "contain", label: t("Contain") },
      { value: "fixed", label: t("Fixed") }
    ],
    [t]
  );

  const [preview, setPreview] = useAtom(PhotoOverlayPreviewAtom);

  useEffect(() => {
    setPreview((prev) => ({
      value: getPhotoOverlayValue(feature?.feature.properties),
      transparency: prev?.transparency ?? 1
    }));
  }, [feature?.feature.properties, setPreview]);

  const handlePhotoUrlChange = useCallback(
    (url: string | undefined) => {
      setPreview((prev) => ({
        ...prev,
        value: { ...prev?.value, url, widthPct: undefined }
      }));
    },
    [setPreview]
  );

  const handlePhotoSizeTypeChange = useCallback(
    (fill: string) => {
      if (!fill || !["contain", "fixed"].includes(fill)) return;
      const fillValue = fill as "contain" | "fixed";
      setPreview((prev) => ({
        ...prev,
        value: {
          ...prev?.value,
          fill: fillValue,
          widthPct: fillValue === "contain" ? undefined : prev?.value?.widthPct
        }
      }));
    },
    [setPreview]
  );

  const handlePhotoWidthPctChange = useCallback(
    (widthPct: number | undefined) => {
      setPreview((prev) => ({
        ...prev,
        value: { ...prev?.value, widthPct }
      }));
    },
    [setPreview]
  );

  const handlePhotoDescriptionChange = useCallback(
    (description: string | undefined) => {
      setPreview((prev) => ({
        ...prev,
        value: { ...prev?.value, description }
      }));
    },
    [setPreview]
  );

  const handleCameraChange = useCallback(
    (camera: Camera | undefined) => {
      setPreview((prev) => ({
        ...prev,
        value: {
          ...prev?.value,
          camera: camera
            ? {
                // Note: we don't need aspect ratio here
                lng: camera.lng,
                lat: camera.lat,
                height: camera.height,
                heading: camera.heading,
                pitch: camera.pitch,
                roll: camera.roll,
                fov: camera.fov
              }
            : undefined
        }
      }));
    },
    [setPreview]
  );

  const handlePreviewTransparencyChange = useCallback(
    (transparency: number | undefined) => {
      setPreview((prev) => ({
        ...prev,
        transparency: transparency ?? 1
      }));
    },
    [setPreview]
  );

  const handleCancel = useCallback(() => {
    visualizerRef?.current?.layers?.select(undefined);
    setTimeout(() => {
      setFeature(RESET);
      setPreview(RESET);
    }, 100);
  }, [setFeature, setPreview, visualizerRef]);

  const handleSave = useCallback(async () => {
    if (!feature || !preview?.value) return;
    await handleGeoJsonFeatureUpdate?.({
      layerId: feature.layerId,
      featureId: feature.dataFeatureId,
      geometry: feature.feature.geometry,
      properties: generateNewPropertiesWithPhotoOverlay(
        feature.feature.properties,
        preview.value
      )
    });
    handleCancel();
  }, [feature, handleGeoJsonFeatureUpdate, preview?.value, handleCancel]);

  const imageDimensionCheckAbortController = useRef<AbortController | null>(
    null
  );

  useEffect(() => {
    if (imageDimensionCheckAbortController.current) {
      imageDimensionCheckAbortController.current.abort();
    }

    if (
      preview?.value?.url &&
      preview?.value?.fill === "fixed" &&
      preview?.value?.widthPct === undefined
    ) {
      const controller = new AbortController();
      imageDimensionCheckAbortController.current = controller;

      getImageDimensions(preview.value.url, controller).then((dimensions) => {
        const coreDomElement = document.getElementById(VISUALIZER_CORE_DOM_ID);
        if (!coreDomElement) return;
        const coreDomRect = coreDomElement.getBoundingClientRect();
        const wrapperSize = {
          width: coreDomRect.width * 0.9,
          height: coreDomRect.height * 0.9
        };
        const imgAspectRatio = dimensions.width / dimensions.height;
        const wrapperAspectRatio = wrapperSize.width / wrapperSize.height;

        let imageWidthPct = 0;
        if (wrapperAspectRatio > imgAspectRatio) {
          const imageWidth = wrapperSize.height * imgAspectRatio;
          imageWidthPct = (imageWidth / coreDomRect.width) * 100;
        } else {
          imageWidthPct = (wrapperSize.width / coreDomRect.width) * 100;
        }

        setPreview((prev) => ({
          ...prev,
          value: { ...prev?.value, widthPct: imageWidthPct }
        }));
      });
    }
  }, [
    preview?.value?.url,
    preview?.value?.fill,
    preview?.value?.widthPct,
    setPreview
  ]);

  return (
    <Wrapper>
      <InteractiveWrapper>
        <Panel width={233}>
          <FieldsWrapper>
            <SliderField
              title={t("Photo transparency")}
              value={preview?.transparency}
              min={0}
              max={1}
              step={0.01}
              onChange={handlePreviewTransparencyChange}
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
                disabled={!preview?.value}
              />
            </ActionWrapper>
          }
        >
          <FieldsWrapper>
            <AssetField
              title={t("Photo")}
              value={preview?.value?.url}
              onChange={handlePhotoUrlChange}
              inputMethod="asset"
              assetsTypes={IMAGE_TYPES}
            />
            <RadioGroupField
              title={t("Photo size type")}
              value={preview?.value?.fill ?? DEFAULT_PHOTO_SIZE_TYPE}
              options={photoSizeTypeOptions}
              onChange={handlePhotoSizeTypeChange}
            />
            {preview?.value?.fill === "fixed" && (
              <SliderField
                title={t("Photo size")}
                value={preview?.value?.widthPct ?? 0}
                min={0}
                max={100}
                step={1}
                onChange={handlePhotoWidthPctChange}
              />
            )}
            <TextareaField
              title={t("Photo description")}
              value={preview?.value?.description}
              rows={3}
              onChange={handlePhotoDescriptionChange}
            />
          </FieldsWrapper>
          <Divider />
          <FieldsWrapper>
            <CameraField
              title={t("Camera")}
              value={preview?.value?.camera}
              onSave={handleCameraChange}
              withFOV
              onFlyTo={handleFlyTo}
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

const InteractiveWrapper = styled("div")({
  pointerEvents: "all"
});

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
