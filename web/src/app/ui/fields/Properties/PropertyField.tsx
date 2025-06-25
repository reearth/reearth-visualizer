import { Camera, LatLng } from "@reearth/app/utils/value";
import { FlyTo } from "@reearth/core";
import { Field, SchemaField } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useMemo } from "react";

import {
  AssetField,
  CameraField,
  ColorField,
  InputField,
  NumberField,
  SelectField,
  SpacingField,
  SwitchField,
  TextareaField,
  TimePointField,
  TwinInputField,
  SliderField,
  RangeField
} from "..";
import { SpacingValues } from "../SpacingField";
import ZoomLevelField from "../ZoomLevelField";

import useHooks from "./hooks";

type Props = {
  propertyId: string;
  itemId?: string;
  schemaGroup: string;
  schema: SchemaField;
  field?: Field;
  onFlyTo?: FlyTo;
};

const PropertyField: FC<Props> = ({
  propertyId,
  itemId,
  field,
  schemaGroup,
  schema,
  onFlyTo
}) => {
  const t = useT();
  const { handlePropertyItemUpdate } = useHooks(propertyId, schemaGroup);
  const value = useMemo(
    () => field?.mergedValue ?? field?.value ?? schema.defaultValue,
    [field?.mergedValue, field?.value, schema.defaultValue]
  );

  const assetTypes = useMemo(
    () =>
      schema.type === "url"
        ? schema.ui === "image"
          ? ["image" as const]
          : schema.ui === "file"
            ? ["file" as const]
            : undefined
        : undefined,
    [schema.type, schema.ui]
  );

  const handleChange = handlePropertyItemUpdate(schema.id, schema.type, itemId);
  return (
    <>
      {schema.type === "string" ? (
        schema.ui === "datetime" ? (
          <TimePointField
            key={schema.id}
            title={schema.title}
            value={(value as string) ?? ""}
            description={schema.description}
            onChange={handleChange}
          />
        ) : schema.ui === "color" ? (
          <ColorField
            key={schema.id}
            title={schema.title}
            value={(value as string) ?? ""}
            description={schema.description}
            onChange={handleChange}
          />
        ) : schema.ui === "selection" || schema.choices ? (
          <SelectField
            key={schema.id}
            title={schema.title}
            value={(value as string) ?? ""}
            description={schema.description}
            options={
              schema?.choices?.map(({ key, label }) => ({
                value: key,
                label: label
              })) || []
            }
            onChange={handleChange}
          />
        ) : schema.ui === "buttons" ? (
          <p key={schema.id}>Button radio field</p>
        ) : schema.ui === "multiline" ? (
          <TextareaField
            key={schema.id}
            title={schema.title}
            resizable="height"
            value={(value as string) ?? ""}
            description={schema.description}
            onChangeComplete={handleChange}
          />
        ) : (
          <InputField
            key={schema.id}
            title={schema.title}
            value={(value as string) ?? ""}
            description={schema.description}
            placeholder={schema.placeholder}
            onChangeComplete={handleChange}
          />
        )
      ) : schema.type === "url" ? (
        <AssetField
          key={schema.id}
          title={schema.title}
          assetsTypes={assetTypes}
          inputMethod={
            schema.ui === "video" || schema.ui === undefined ? "URL" : "asset"
          }
          value={(value as string) ?? ""}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "spacing" ? (
        <SpacingField
          key={schema.id}
          title={schema.title}
          value={(value as SpacingValues) ?? ""}
          description={schema.description}
          min={schema.min}
          max={schema.max}
          onBlur={handleChange}
        />
      ) : schema.type === "bool" ? (
        <SwitchField
          key={schema.id}
          title={schema.title}
          value={!!value}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "number" ? (
        schema.ui === "slider" ? (
          <SliderField
            key={schema.id}
            title={schema.title}
            value={value as number}
            min={schema.min}
            max={schema.max}
            description={schema.description}
            onChangeComplete={handleChange}
          />
        ) : (
          <NumberField
            key={schema.id}
            title={schema.title}
            value={(value as number) ?? ""}
            unit={schema.suffix}
            min={schema.min}
            max={schema.max}
            description={schema.description}
            onChangeComplete={handleChange}
          />
        )
      ) : schema.type === "latlng" ? (
        <TwinInputField
          key={schema.id}
          title={schema.title}
          values={[(value as LatLng)?.lat, (value as LatLng)?.lng]}
          description={schema.description}
          onBlur={handleChange}
        />
      ) : schema.type === "camera" ? (
        <CameraField
          key={schema.id}
          title={schema.title}
          value={value as Camera}
          description={schema.description}
          onSave={handleChange}
          onFlyTo={onFlyTo}
        />
      ) : schema.type === "array" && schema.ui === "zoomLevel" ? (
        <ZoomLevelField
          key={schema.id}
          title={schema.title}
          value={value as number[]}
          min={schema.min}
          max={schema.max}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "array" && schema.ui === "range" ? (
        <RangeField
          key={schema.id}
          title={schema.title}
          values={value as number[]}
          unit={schema.suffix}
          min={schema.min}
          max={schema.max}
          content={[t("min"), t("max")]}
          description={schema.description}
          onBlur={handleChange}
        />
      ) : (
        <p key={schema.id}>{schema.title} field</p>
      )}
    </>
  );
};

export default PropertyField;
