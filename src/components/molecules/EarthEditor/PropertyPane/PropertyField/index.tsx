import React, { useCallback } from "react";

import { styled } from "@reearth/theme";
import PropertyTitle, {
  Props as PropertyTitleProps,
} from "@reearth/components/molecules/EarthEditor/PropertyPane/PropertyField/PropertyTitle";
import {
  ValueType as ValueTypeType,
  ValueTypes as ValueTypesType,
  LatLng as LatLngType,
  Camera,
} from "@reearth/util/value";
import { useBind } from "@reearth/util/use-bind";
import { metricsSizes } from "@reearth/theme/metrics";

import SwitchField from "./SwitchField";
import LocationField, { Location as LocationType } from "./LocationField";
import TextField from "./TextField";
import NumberField from "./NumberField";
import URLField, { Asset as AssetType } from "./URLField";
import CameraField from "./CameraField";
import ColorField from "./ColorField";
import SelectField from "./SelectField";
import RadioField from "./RadioField";
import NonEditableField from "./NonEditableField";
import TypographyField from "./TypographyField";
import LayerField, { Layer as LayerType } from "./LayerField";
import { FieldProps } from "./types";
import Flex from "@reearth/components/atoms/Flex";

export { Dataset, DatasetSchema, DatasetField, Type as DatasetType } from "./PropertyTitle";

export type ValueType = ValueTypeType;
export type ValueTypes = ValueTypesType;
export type LatLng = LatLngType;
export type Location = LocationType;
export type Layer = LayerType;
export type Asset = AssetType;

export type SchemaField<T extends ValueType = ValueType> = {
  id: string;
  type: T;
  defaultValue?: ValueTypes[T];
  prefix?: string;
  suffix?: string;
  name?: string;
  description?: string;
  notLinkable?: boolean;
  ui?:
    | "color"
    | "multiline"
    | "selection"
    | "buttons"
    | "range"
    | "image"
    | "video"
    | "file"
    | "layer"
    | "cameraPose";
  choices?: {
    key: string;
    label: string;
    icon?: string | undefined;
  }[];
  min?: number;
  max?: number;
};

export type Field<T extends ValueType = ValueType> = {
  id: string;
  type: T;
  value?: ValueTypes[T];
  mergedValue?: ValueTypes[T];
  overridden?: boolean;
  link?: {
    inherited?: boolean;
    schema: string;
    dataset?: string;
    field: string;
    schemaName?: string;
    datasetName?: string;
    fieldName?: string;
  };
};

export type Props<T extends ValueType = ValueType> = {
  field?: Field;
  schema?: SchemaField;
  linkedDatasetSchemaId?: string;
  linkedDatasetId?: string;
  isDatasetLinkable?: boolean;
  hidden?: boolean;
  notLinkable?: boolean;
  isCapturing?: boolean;
  camera?: Camera;
  layers?: LayerType[];
  assets?: Asset[];
  onChange?: (id: string, value: ValueTypes[T] | null, type: ValueType) => void;
  onRemove?: (id: string) => void;
  onLink?: (id: string, schema: string, dataset: string | undefined, field: string) => void;
  onUnlink?: (id: string) => void;
  onUploadFile?: (id: string, file: File) => void;
  onRemoveFile?: (id: string) => void;
  onCreateAsset?: (files: FileList) => void;
  onIsCapturingChange?: (isCapturing: boolean) => void;
  onCameraChange?: (camera: Partial<Camera>) => void;
} & Pick<PropertyTitleProps, "datasetSchemas" | "onDatasetPickerOpen">;

const PropertyField: React.FC<Props> = ({
  onChange,
  onRemove: onClear,
  field,
  schema,
  onUploadFile,
  onCreateAsset,
  onRemoveFile,
  hidden,
  isCapturing,
  onIsCapturingChange,
  camera,
  onCameraChange,
  onLink,
  onUnlink,
  datasetSchemas,
  isDatasetLinkable,
  onDatasetPickerOpen,
  linkedDatasetSchemaId,
  linkedDatasetId,
  layers,
  assets,
}) => {
  const events = useBind(
    {
      onClear,
      onUploadFile,
      onRemoveFile,
      onLink,
      onUnlink,
    },
    schema?.id,
  );

  const commonProps: FieldProps<any> = {
    linked: !!field?.link,
    disabled: !!field?.link && !field?.link.inherited,
    overridden: !!field?.overridden,
    value: field?.mergedValue ?? field?.value ?? schema?.defaultValue,
    onChange: useCallback(
      (value: ValueTypes[keyof ValueTypes] | null) => {
        if (!onChange || !schema) return;
        onChange(schema.id, value, schema.type);
      },
      [schema, onChange],
    ),
    ...events,
  };

  const linkedDatasetFieldName =
    field?.link && !field.link.dataset ? field.link.fieldName ?? field.link.field : undefined;

  const type = schema?.type;

  return hidden ? null : (
    <FormItemWrapper
      schema={schema}
      direction={schema?.ui === "multiline" ? "column" : "row"}
      align={schema?.ui === "multiline" ? "flex-start" : "center"}>
      <StyledPropertyTitleWrapper>
        <PropertyTitle
          title={schema?.name || schema?.id || field?.id || ""}
          description={schema?.description}
          isDatasetLinkable={isDatasetLinkable}
          isLinked={commonProps.linked}
          isOverridden={commonProps.overridden}
          linkedDataset={field?.link}
          datasetSchemas={datasetSchemas}
          linkDisabled={!schema || schema?.notLinkable}
          linkableType={schema?.type}
          onDatasetPickerOpen={onDatasetPickerOpen}
          fixedDatasetSchemaId={linkedDatasetSchemaId}
          fixedDatasetId={linkedDatasetId}
          {...events}
        />
      </StyledPropertyTitleWrapper>
      <StyledPropertyFieldWrapper>
        {linkedDatasetFieldName || !schema ? (
          <NonEditableField linkedDatasetFieldName={linkedDatasetFieldName} />
        ) : type === "bool" ? (
          <SwitchField {...commonProps} />
        ) : type === "latlng" ? (
          <LocationField {...commonProps} />
        ) : type === "number" ? (
          <NumberField
            {...commonProps}
            suffix={schema.suffix}
            range={schema.ui === "range"}
            max={schema.max}
            min={schema.min}
          />
        ) : type === "string" ? (
          schema.ui === "color" ? (
            <ColorField {...commonProps} />
          ) : schema.ui === "selection" || schema.choices ? (
            <SelectField {...commonProps} items={schema.choices} />
          ) : schema.ui === "buttons" ? (
            <RadioField {...commonProps} items={schema.choices} />
          ) : (
            <TextField
              {...commonProps}
              prefix={schema?.prefix}
              suffix={schema?.suffix}
              multiline={schema.ui === "multiline"}
            />
          )
        ) : type === "url" ? (
          <URLField
            {...commonProps}
            fileType={
              schema.ui === "image" || schema.ui === "video" || schema.ui === "file"
                ? schema.ui
                : undefined
            }
            assets={assets}
            onCreateAsset={onCreateAsset}
          />
        ) : type === "typography" ? (
          <TypographyField {...commonProps} />
        ) : type === "camera" ? (
          <CameraField
            {...commonProps}
            isCapturing={isCapturing}
            onIsCapturingChange={onIsCapturingChange}
            camera={camera}
            onCameraChange={onCameraChange}
            onDelete={events.onClear}
            onlyPose={schema.ui === "cameraPose"}
          />
        ) : type === "ref" && schema.ui === "layer" ? (
          <LayerField {...commonProps} layers={layers} />
        ) : (
          <NonEditableField />
        )}
      </StyledPropertyFieldWrapper>
    </FormItemWrapper>
  );
};

const FormItemWrapper = styled(Flex)<{ schema?: SchemaField }>`
  margin-bottom: ${metricsSizes.l}px;
`;

const StyledPropertyTitleWrapper = styled.div`
  flex: 1;
  font-size: 12px;
  line-height: 110%;
  margin-right: ${metricsSizes.s}px;
`;

const StyledPropertyFieldWrapper = styled.div`
  flex: 2;
  width: 100%;
`;

export default PropertyField;
