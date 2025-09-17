import {
  ValueType,
  valueFromGQL,
  valueTypeFromGQL
} from "@reearth/app/utils/value";

import {
  Maybe,
  MergedPropertyField,
  MergedPropertyFragmentFragment,
  MergedPropertyGroupCommonFragmentFragment,
  MergedPropertyGroupFragmentFragment,
  PropertyCondition,
  PropertyField,
  PropertyFragmentFragment,
  PropertyItemFragmentFragment,
  PropertySchemaField,
  PropertySchemaFieldUi,
  PropertySchemaGroupFragmentFragment,
  ValueType as GQLValueType
} from "../../gql";

import { Field, GroupListItem, Item, SchemaField } from "./types";

type Links = Maybe<
  {
    schema?: Maybe<string>;
    datasetSchemaId?: Maybe<string>;
    datasetId?: Maybe<string>;
    datasetSchemaFieldId?: Maybe<string>;
    dataset?: Maybe<{ name?: Maybe<string> }>;
    datasetSchema?: Maybe<{ name?: Maybe<string> }>;
    datasetSchemaField?: Maybe<{ name?: Maybe<string> }>;
  }[]
>;

const linkableType: ValueType[] = ["bool", "string", "number", "latlng", "url"];

export const convert = (
  property: PropertyFragmentFragment | null | undefined,
  merged?: MergedPropertyFragmentFragment | null
) => {
  if (!property?.schema) return;
  const {
    items,
    schema: { groups: schemaGroups }
  } = property;

  return schemaGroups
    .map((g) => {
      const item = items.find((i) => i.schemaGroupId === g.schemaGroupId);
      const mergedGroup = merged?.groups.find(
        (i) => i.schemaGroupId === g.schemaGroupId
      );
      return toItem(g, item, mergedGroup);
    })
    .filter((g): g is Item => !!g);
};

const toItem = (
  schemaGroup: PropertySchemaGroupFragmentFragment,
  item?: PropertyItemFragmentFragment,
  merged?:
    | MergedPropertyGroupFragmentFragment
    | MergedPropertyGroupCommonFragmentFragment
): Item | undefined => {
  const common: Pick<
    Item,
    | "id"
    | "schemaGroup"
    | "title"
    | "collection"
    | "only"
    | "schemaFields"
    | "representativeField"
  > = {
    id: item?.id,
    schemaGroup: schemaGroup.schemaGroupId,
    title: schemaGroup.translatedTitle,
    collection: schemaGroup.collection,
    only: toCond(schemaGroup.isAvailableIf),
    representativeField: schemaGroup.representativeFieldId ?? undefined,
    schemaFields: schemaGroup.fields
      .map((f): SchemaField | undefined => {
        const t = valueTypeFromGQL(f.type);
        if (!t) return undefined;
        return {
          id: f.fieldId,
          type: t,
          defaultValue: f.defaultValue,
          suffix: f.suffix ?? undefined,
          title: f.translatedTitle,
          description: f.translatedDescription,
          placeholder: f.translatedPlaceholder,
          only: toCond(f.isAvailableIf),
          choices: f.choices?.map((c) => ({
            key: c.key,
            label: c.translatedTitle
          })),
          ui: toUi(f.ui),
          min: f.min ?? undefined,
          max: f.max ?? undefined,
          isLinkable: linkableType.includes(t)
        };
      })
      .filter((f): f is SchemaField => !!f)
  };

  if (schemaGroup.isList) {
    const items = (item && "groups" in item ? item.groups : []).map(
      (item2, i): GroupListItem => {
        const mergedGroup =
          merged && "groups" in merged ? merged.groups[i] : undefined;
        return {
          id: item2.id,
          fields: toFields(schemaGroup, item2, mergedGroup)
        };
      }
    );
    return {
      ...common,
      items
    };
  }

  return {
    ...common,
    fields: toFields(schemaGroup, item, merged)
  };
};

const toFields = (
  schemaGroup: PropertySchemaGroupFragmentFragment,
  item?: PropertyItemFragmentFragment,
  merged?:
    | MergedPropertyGroupFragmentFragment
    | MergedPropertyGroupCommonFragmentFragment
) =>
  schemaGroup.fields
    .map(
      (f) =>
        [
          f,
          item && "fields" in item
            ? item.fields.find((f2) => f2.fieldId === f.fieldId)
            : undefined,
          merged?.fields.find((f2) => f2.fieldId === f.fieldId)
        ] as const
    )
    .map((f) => toField(f[0], f[1], f[2]))
    .filter((f): f is Field => !!f);

const toField = (
  schemaField: Pick<PropertySchemaField, "fieldId" | "type">,
  field?: Pick<PropertyField, "fieldId" | "value"> & {
    links?: Links;
  },
  merged?: Pick<MergedPropertyField, "fieldId" | "overridden"> & {
    links?: Links;
  }
): Field | undefined => {
  if (
    (!field && !merged) ||
    (field && field.fieldId !== schemaField.fieldId) ||
    (merged && merged.fieldId !== schemaField.fieldId)
  ) {
    return;
  }

  const { value, type } = valueFromGQL(field?.value, schemaField.type) ?? {};
  if (!type) return;
  const links = merged?.links ?? field?.links ?? undefined;

  return {
    id: schemaField.fieldId,
    type,
    value: value,
    overridden: !!merged?.overridden,
    link:
      links?.length && links[0].datasetSchemaId && links[0].datasetSchemaFieldId
        ? {
            inherited: !!merged?.links && !field?.links,
            schema: links[0].datasetSchemaId,
            dataset: links[0].datasetId ?? undefined,
            field: links[0].datasetSchemaFieldId,
            schemaName: links[0].datasetSchema?.name ?? undefined,
            datasetName: links[0].dataset?.name ?? undefined,
            fieldName: links[0].datasetSchemaField?.name ?? undefined
          }
        : undefined
  };
};

export const toUi = (
  ui: PropertySchemaFieldUi | null | undefined
): SchemaField["ui"] => {
  switch (ui) {
    case PropertySchemaFieldUi.Color:
      return "color";
    case PropertySchemaFieldUi.File:
      return "file";
    case PropertySchemaFieldUi.Image:
      return "image";
    case PropertySchemaFieldUi.Multiline:
      return "multiline";
    case PropertySchemaFieldUi.Range:
      return "range";
    case PropertySchemaFieldUi.Slider:
      return "slider";
    case PropertySchemaFieldUi.Selection:
      return "selection";
    case PropertySchemaFieldUi.Video:
      return "video";
    case PropertySchemaFieldUi.Layer:
      return "layer";
    case PropertySchemaFieldUi.CameraPose:
      return "cameraPose";
    case PropertySchemaFieldUi.Margin:
      return "margin";
    case PropertySchemaFieldUi.Padding:
      return "padding";
    case PropertySchemaFieldUi.Datetime:
      return "datetime";
    case PropertySchemaFieldUi.Zoomlevel:
      return "zoomLevel";
    case PropertySchemaFieldUi.PropertySelector:
      return "propertySelector";
  }
  return undefined;
};

const toCond = (cond: PropertyCondition | null | undefined) => {
  if (
    (cond?.type !== GQLValueType.String || typeof cond.value !== "string") &&
    (cond?.type !== GQLValueType.Bool || typeof cond.value !== "boolean")
  ) {
    return undefined;
  }
  return {
    field: cond.fieldId,
    value: cond.value
  };
};
