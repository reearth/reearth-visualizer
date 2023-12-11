import { useMemo } from "react";

import { FlyTo } from "@reearth/beta/lib/core/types";
import { LatLng } from "@reearth/beta/utils/value";
import { Field, SchemaField } from "@reearth/services/api/propertyApi/utils";

import CameraField from "../../CameraField";
import { Camera } from "../../CameraField/types";
import ColorField from "../../ColorField";
import DateTimeField from "../../DateTimeField";
import LocationField from "../../LocationField";
import NumberField from "../../NumberField";
import RangeField from "../../RangeField";
import SelectField from "../../SelectField";
import SliderField from "../../SliderField";
import SpacingInput, { SpacingValues } from "../../SpacingInput";
import TextInput from "../../TextField";
import ToggleField from "../../ToggleField";
import URLField from "../../URLField";

import useHooks from "./hooks";

type Props = {
  propertyId: string;
  itemId?: string;
  schemaGroup: string;
  schema: SchemaField;
  field?: Field;
  currentCamera?: Camera;
  onFlyTo?: FlyTo;
};

const PropertyField: React.FC<Props> = ({
  propertyId,
  itemId,
  field,
  schemaGroup,
  schema,
  currentCamera,
  onFlyTo,
}) => {
  const { handlePropertyValueUpdate } = useHooks(propertyId, schemaGroup);

  const value = useMemo(
    () => field?.mergedValue ?? field?.value ?? schema.defaultValue,
    [field?.mergedValue, field?.value, schema.defaultValue],
  );

  const handleChange = handlePropertyValueUpdate(schema.id, schema.type, itemId);
  return (
    <>
      {schema.type === "string" ? (
        schema.ui === "datetime" ? (
          <DateTimeField
            key={schema.id}
            name={schema.name}
            value={(value as string) ?? ""}
            description={schema.description}
            onChange={handleChange}
          />
        ) : schema.ui === "color" ? (
          <ColorField
            key={schema.id}
            name={schema.name}
            value={(value as string) ?? ""}
            description={schema.description}
            onChange={handleChange}
          />
        ) : schema.ui === "selection" || schema.choices ? (
          <SelectField
            key={schema.id}
            name={schema.name}
            value={(value as string) ?? ""}
            description={schema.description}
            options={schema.choices}
            onChange={handleChange}
          />
        ) : schema.ui === "buttons" ? (
          <p key={schema.id}>Button radio field</p>
        ) : (
          <TextInput
            key={schema.id}
            name={schema.name}
            value={(value as string) ?? ""}
            description={schema.description}
            onChange={handleChange}
          />
        )
      ) : schema.type === "url" ? (
        <URLField
          key={schema.id}
          name={schema.name}
          entityType={schema.ui === "image" ? "image" : schema.ui === "file" ? "file" : undefined}
          fileType={schema.ui === "video" || schema.ui === undefined ? "URL" : "asset"}
          value={(value as string) ?? ""}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "spacing" ? (
        <SpacingInput
          key={schema.id}
          name={schema.name}
          value={(value as SpacingValues) ?? ""}
          description={schema.description}
          min={schema.min}
          max={schema.max}
          onChange={handleChange}
        />
      ) : schema.type === "bool" ? (
        <ToggleField
          key={schema.id}
          name={schema.name}
          checked={!!value}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "number" ? (
        schema.ui === "slider" ? (
          <SliderField
            key={schema.id}
            name={schema.name}
            value={value as number}
            min={schema.min}
            max={schema.max}
            description={schema.description}
            onChange={handleChange}
          />
        ) : (
          <NumberField
            key={schema.id}
            name={schema.name}
            value={(value as number) ?? ""}
            suffix={schema.suffix}
            min={schema.min}
            max={schema.max}
            description={schema.description}
            onChange={handleChange}
          />
        )
      ) : schema.type === "latlng" ? (
        <LocationField
          key={schema.id}
          name={schema.name}
          value={value as LatLng}
          description={schema.description}
          onChange={handleChange}
        />
      ) : schema.type === "camera" ? (
        <CameraField
          key={schema.id}
          name={schema.name}
          value={value as Camera}
          description={schema.description}
          currentCamera={currentCamera}
          onSave={handleChange}
          onFlyTo={onFlyTo}
        />
      ) : schema.type === "array" && schema.ui === "range" ? (
        <RangeField
          key={schema.id}
          name={schema.name}
          value={value as number[]}
          defaultValue={schema.defaultValue as number[]}
          min={schema.min}
          max={schema.max}
          description={schema.description}
          onChange={handleChange}
        />
      ) : (
        <p key={schema.id}>{schema.name} field</p>
      )}
    </>
  );
};

export default PropertyField;
