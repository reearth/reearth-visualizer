import { SpacingValues } from "@reearth/beta/ui/fields/SpacingField";
import { Camera, LatLng } from "@reearth/beta/utils/value";
import { SchemaField } from "@reearth/services/api/propertyApi/utils";
import { FC, useMemo, useState } from "react";

import {
  ColorField,
  InputField,
  SelectField,
  TimePointField,
  TextareaField,
  AssetField,
  SpacingField,
  SwitchField,
  SliderField,
  NumberField,
  TwinInputField,
  CameraField,
  RangeField
} from "../../../ui/fields";

type Props = {
  field: SchemaField;
};

const PropertyItem: FC<Props> = ({ field }) => {
  const [value, setValue] = useState<
    boolean | LatLng | number | number[] | string | string[] | SpacingValues
  >("");

  const assetTypes: "image"[] | "file"[] | undefined = useMemo(
    () =>
      field.type === "url"
        ? field.ui === "image"
          ? ["image" as const]
          : field.ui === "file"
            ? ["file" as const]
            : undefined
        : undefined,
    [field.type, field.ui]
  );

  const handleChange = (
    newValue:
      | boolean
      | LatLng
      | number
      | number[]
      | string
      | string[]
      | SpacingValues,
    fieldType: "bool" | "camera" | "number" | "spacing" | "string" | "url"
  ): void => {
    switch (fieldType) {
      case "bool":
        setValue(newValue);
        break;
      case "camera":
        setValue(newValue);
        break;
      case "spacing":
        setValue(newValue);
        break;
      case "string":
        setValue(newValue);
        break;
      case "url":
        setValue(newValue);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {field.type === "string" ? (
        field.ui === "datetime" ? (
          <TimePointField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={(newValue?: string) =>
              handleChange(newValue || "", "string")
            }
          />
        ) : field.ui === "selection" ? (
          <SelectField
            key={field.id}
            title={field.name}
            value={(value as string) ?? ""}
            description={field.description}
            options={
              field?.choices?.map(
                ({ key, label }: { key: string; label: string }) => ({
                  value: key,
                  label: label
                })
              ) || []
            }
            onChange={(newValue: string | string[]) =>
              handleChange(newValue, "string")
            }
          />
        ) : field.ui === "color" ? (
          <ColorField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={(newValue: string) => handleChange(newValue, "string")}
          />
        ) : field.ui === "multiline" ? (
          <TextareaField
            key={field.id}
            title={field.name}
            resizable="height"
            description={field.description}
            value={(value as string) ?? ""}
            onChange={(newValue: string) => handleChange(newValue, "string")}
          />
        ) : (
          <InputField
            key={field.id}
            title={field.name}
            value={value as string}
            description={field.description}
            onChange={(newValue: string) => handleChange(newValue, "string")}
          />
        )
      ) : field.type === "url" ? (
        <AssetField
          key={field.id}
          title={field.name}
          assetsTypes={assetTypes}
          description={field.description}
          inputMethod={
            field.ui === "video" || field.ui === undefined ? "URL" : "asset"
          }
          value={value as string}
          onChange={(newValue?: string) =>
            handleChange(newValue || "", "string")
          }
        />
      ) : field.type === "spacing" ? (
        <SpacingField
          key={field.id}
          title={field.name}
          value={(value as SpacingValues) ?? ""}
          description={field.description}
          min={field.min}
          max={field.max}
          onChange={(newValue: SpacingValues) =>
            handleChange(newValue, "spacing")
          }
        />
      ) : field.type === "bool" ? (
        <SwitchField
          key={field.id}
          title={field.name}
          description={field.description}
          value={!!value}
          onChange={(newValue: boolean) => handleChange(newValue, "bool")}
        />
      ) : field.type === "number" ? (
        field.ui === "slider" ? (
          <SliderField
            key={field.id}
            title={field.name}
            value={value as number}
            description={field.description}
            min={field.min}
            max={field.max}
            onChange={(newValue: number) => handleChange(newValue, "number")}
          />
        ) : (
          <NumberField
            key={field.id}
            title={field.name}
            value={(value as number) ?? ""}
            unit={field.suffix}
            description={field.description}
            min={field.min}
            max={field.max}
            onChange={(newValue?: number) =>
              handleChange(newValue ?? 0, "number")
            }
          />
        )
      ) : field.type === "latlng" ? (
        <TwinInputField
          key={field.id}
          title={field.name}
          values={[(value as LatLng)?.lat, (value as LatLng)?.lng]}
          description={field.description}
          onBlur={(newValue?: number[]) =>
            handleChange(newValue ?? 0, "number")
          }
        />
      ) : field.type === "camera" ? (
        <CameraField
          key={field.id}
          title={field.name}
          value={value as Camera}
          description={field.description}
          onSave={(newValue?: Camera) =>
            handleChange(newValue as Camera, "camera")
          }
        />
      ) : field.type === "array" && field.ui === "range" ? (
        <RangeField
          key={field.id}
          title={field.name}
          values={value as number[]}
          unit={field.suffix}
          min={field.min}
          max={field.max}
          content={["min", "max"]}
          description={field.description}
          onBlur={(newValue?: (number | undefined)[]) =>
            handleChange(
              newValue?.filter((v): v is number => v !== undefined) ?? [],
              "number"
            )
          }
        />
      ) : (
        <p key={field.id}>{field.name} field</p>
      )}
    </>
  );
};

export default PropertyItem;
