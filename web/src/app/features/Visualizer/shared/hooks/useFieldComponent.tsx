import {
  AssetField,
  CameraField,
  ColorField,
  InputField,
  NumberField,
  RangeField,
  SelectField,
  SpacingField,
  SwitchField,
  TimePeriodField,
  TimePointField,
  TwinInputField,
  PropertySelectorField
} from "@reearth/app/ui/fields";
import type { ValueType, ValueTypes, LatLng, Spacing, Timeline, Camera } from "@reearth/app/utils/value";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo } from "react";

import type { ContentSettingsField } from "../types";

export const FieldComponent = ({
  propertyId,
  groupId,
  fieldId,
  field,
  onPropertyUpdate,
  propertyNames
}: {
  propertyId: string;
  groupId: string;
  fieldId: string;
  field: ContentSettingsField;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  propertyNames?: string[] | undefined;
}) => {
  const t = useT();
  const handlePropertyValueUpdate = useCallback(
    (
      schemaGroupId: string,
      propertyId: string,
      fieldId: string,
      vt: ValueType,
      itemId?: string
    ) => {
      return async (v?: ValueTypes[ValueType]) => {
        await onPropertyUpdate?.(
          propertyId,
          schemaGroupId,
          fieldId,
          itemId,
          vt,
          v
        );
      };
    },
    [onPropertyUpdate]
  );

  const assetsTypes = useMemo(
    () =>
      field.ui === "image"
        ? ["image" as const]
        : field.ui === "file"
          ? ["file" as const]
          : undefined,
    [field.ui]
  );

  const propertyOption = propertyNames?.map((property) => ({
    value: property,
    label: property
  }));

  return field?.type === "spacing" ? (
    <SpacingField
      key={field?.id}
      title={field?.title}
      value={field?.type === "spacing" ? (field?.value as Spacing) : undefined}
      description={field?.description}
      min={field?.min}
      max={field?.max}
      onBlur={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "bool" ? (
    <SwitchField
      key={field?.id}
      title={field?.title}
      value={!!field?.value}
      description={field?.description}
      onChange={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "latlng" ? (
    <TwinInputField
      key={field?.id}
      title={field?.title}
      values={field?.type === "latlng" && field?.value ? 
        [(field?.value as LatLng).lat, (field?.value as LatLng).lng] : [0, 0]}
      description={field?.description}
      onBlur={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "camera" ? (
    <CameraField
      key={field?.id}
      title={field?.title}
      value={field?.type === "camera" ? (field?.value as Camera) : undefined}
      description={field?.description}
      onSave={handlePropertyValueUpdate(
        propertyId,
        groupId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "number" ? (
    <NumberField
      title={field?.title}
      value={field?.type === "number" ? (field?.value as number) : undefined}
      description={field?.description}
      min={field?.min}
      max={field?.max}
      onBlur={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "url" ? (
    <AssetField
      key={field.id}
      title={field.title}
      assetsTypes={assetsTypes}
      inputMethod={
        field.ui === "video" || field.ui === undefined ? "URL" : "asset"
      }
      value={field?.type === "url" ? (field?.value as string) : ""}
      description={field.description}
      onChange={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "string" ? (
    field?.ui === "datetime" ? (
      <TimePointField
        key={field.id}
        title={field?.title}
        description={field?.description}
        value={field?.type === "string" ? (field?.value as string) : ""}
        onChange={handlePropertyValueUpdate(
          groupId,
          propertyId,
          fieldId,
          field?.type
        )}
      />
    ) : field?.ui === "color" ? (
      <ColorField
        key={field.id}
        title={field?.title}
        description={field?.description}
        value={field?.type === "string" ? (field?.value as string) : ""}
        onChange={handlePropertyValueUpdate(
          groupId,
          propertyId,
          fieldId,
          field?.type
        )}
      />
    ) : field?.ui === "selection" || field?.choices ? (
      <SelectField
        key={field.id}
        title={field.title}
        value={field?.type === "string" ? (field?.value as string) : ""}
        description={field.description}
        options={
          field?.choices?.map(
            ({ key, label }: { key: string; label: string }) => ({
              value: key,
              label: label
            })
          ) || []
        }
        onChange={handlePropertyValueUpdate(
          groupId,
          propertyId,
          fieldId,
          field?.type
        )}
      />
    ) : field?.ui === "propertySelector" ? (
      <PropertySelectorField
        key={field.id}
        title={field?.title}
        value={field?.type === "string" ? (field?.value as string) : ""}
        description={field?.description}
        placeholder={field?.placeholder}
        options={propertyOption}
        displayLabel="{}"
        displayWidth={38}
        menuWidth={107}
        onBlur={handlePropertyValueUpdate(
          groupId,
          propertyId,
          fieldId,
          field?.type
        )}
      />
    ) : (
      <InputField
        key={field.id}
        title={field?.title}
        value={field?.type === "string" ? (field?.value as string) : ""}
        description={field?.description}
        placeholder={field?.placeholder}
        onChangeComplete={handlePropertyValueUpdate(
          groupId,
          propertyId,
          fieldId,
          field?.type
        )}
      />
    )
  ) : field?.type === "timeline" ? (
    <TimePeriodField
      key={field.id}
      title={field?.title}
      value={field?.type === "timeline" && field?.value ? {
        currentTime: (field?.value as Timeline).currentTime ?? "",
        startTime: (field?.value as Timeline).startTime ?? "",
        endTime: (field?.value as Timeline).endTime ?? ""
      } : undefined}
      description={field?.description}
      onChange={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : field?.type === "array" && field?.ui === "range" ? (
    <RangeField
      key={field.id}
      title={field.title}
      values={field?.value as number[]}
      unit={field.suffix}
      min={field.min}
      max={field.max}
      content={["min", "max"]}
      description={field.description}
      onBlur={handlePropertyValueUpdate(
        groupId,
        propertyId,
        fieldId,
        field?.type
      )}
    />
  ) : (
    <div>{t("Unsupported field type")}</div>
  );
};
