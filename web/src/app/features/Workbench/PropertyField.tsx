import {
  CameraField,
  ColorField,
  InputField,
  NumberField,
  RangeField,
  SelectField,
  SliderField,
  SpacingField,
  SwitchField,
  TextareaField,
  TimePointField,
  TwinInputField
} from "@reearth/app/ui/fields";
import type { FC } from "react";

import type { FieldValue, SchemaFieldDef } from "./types";

type Props = {
  field: SchemaFieldDef;
  /** What is stored; `undefined` shows the schema's default instead. */
  value: FieldValue;
  onChange: (value: FieldValue) => void;
};

const asText = (v: unknown) =>
  v === undefined || v === null ? undefined : String(v);

/**
 * One property of an extension. Unlike the online Playground's field, it
 * doesn't need Apollo (a `url` is a plain text input, not the asset picker),
 * keeps `false`, `0` and `""`, and shows defaults while nothing is stored.
 */
const PropertyField: FC<Props> = ({ field, value, onChange }) => {
  // Only `undefined` means "no value": the others are values a user can set.
  const handleChange = (next?: unknown) => {
    if (next !== undefined) onChange(next);
  };
  const shown = value ?? field.defaultValue;
  const common = { title: field.title, description: field.description };
  const placeholder = field.placeholder ?? asText(field.defaultValue);

  switch (field.type) {
    case "string":
      switch (field.ui) {
        case "datetime":
          return (
            <TimePointField
              {...common}
              value={shown as string}
              onChange={handleChange}
            />
          );
        case "selection":
          return (
            <SelectField
              {...common}
              value={(shown as string) ?? ""}
              options={(field.choices ?? []).map(({ key, label }) => ({
                value: key,
                label
              }))}
              onChange={handleChange}
            />
          );
        case "color":
          return (
            <ColorField
              {...common}
              value={shown as string}
              onChange={handleChange}
            />
          );
        case "multiline":
          return (
            <TextareaField
              {...common}
              resizable="height"
              value={(value as string) ?? ""}
              placeholder={placeholder}
              onChangeComplete={handleChange}
            />
          );
        default:
          return (
            <InputField
              {...common}
              value={(value as string) ?? ""}
              placeholder={placeholder}
              onChangeComplete={handleChange}
            />
          );
      }
    case "url":
      return (
        <InputField
          {...common}
          value={(value as string) ?? ""}
          placeholder={placeholder}
          onChangeComplete={handleChange}
        />
      );
    case "spacing":
      return (
        <SpacingField
          {...common}
          value={(shown as never) ?? ""}
          min={field.min}
          max={field.max}
          onChange={handleChange}
        />
      );
    case "bool":
      return (
        <SwitchField {...common} value={!!shown} onChange={handleChange} />
      );
    case "number":
      return field.ui === "slider" ? (
        <SliderField
          {...common}
          value={shown as number}
          min={field.min}
          max={field.max}
          onChange={handleChange}
        />
      ) : (
        <NumberField
          {...common}
          value={(value as number) ?? ""}
          placeholder={placeholder}
          unit={field.suffix}
          min={field.min}
          max={field.max}
          onChangeComplete={handleChange}
        />
      );
    case "latlng": {
      const v = shown as { lat?: number; lng?: number } | undefined;
      return (
        <TwinInputField
          {...common}
          values={[v?.lat ?? 0, v?.lng ?? 0]}
          onBlur={([lat, lng]) => handleChange({ lat, lng })}
        />
      );
    }
    case "camera":
      return (
        <CameraField {...common} value={shown as never} onSave={handleChange} />
      );
    case "array":
      if (field.ui === "range") {
        return (
          <RangeField
            {...common}
            values={shown as number[]}
            unit={field.suffix}
            min={field.min}
            max={field.max}
            content={["min", "max"]}
            onChange={(next: (number | undefined)[]) =>
              handleChange(next.filter((n): n is number => n !== undefined))
            }
          />
        );
      }
      return <p>{field.title}</p>;
    default:
      return <p>{field.title}</p>;
  }
};

export default PropertyField;
