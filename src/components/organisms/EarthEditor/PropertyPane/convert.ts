import {
  SchemaField,
  Field,
  Item,
  Mode as RawMode,
  DatasetSchema,
  Dataset,
  DatasetField,
  GroupListItem,
  Layer,
} from "@reearth/components/molecules/EarthEditor/PropertyPane";
import {
  ValueType as GQLValueType,
  PropertyFragmentFragment,
  PropertyItemFragmentFragment,
  PropertySchemaGroupFragmentFragment,
  MergedPropertyFragmentFragment,
  MergedPropertyGroupFragmentFragment,
  MergedPropertyGroupCommonFragmentFragment,
  PropertyCondition,
  PropertySchemaFieldUi,
  GetLinkableDatasetsQuery,
  PropertyField,
  MergedPropertyField,
  PropertySchemaField,
  GetLayersFromLayerIdQuery,
  Maybe,
} from "@reearth/gql";
import { valueTypeFromGQL, valueFromGQL, ValueType } from "@reearth/util/value";

export type Mode = RawMode;

export type Pane = {
  id: string;
  mode: Mode;
  propertyId?: string;
  title?: string;
  items?: Item[];
  enabled?: boolean;
  group?: boolean;
};

const linkableType: ValueType[] = ["bool", "string", "number", "latlng", "url"];

const toCond = (cond: PropertyCondition | null | undefined) => {
  if (
    (cond?.type !== GQLValueType.String || typeof cond.value !== "string") &&
    (cond?.type !== GQLValueType.Bool || typeof cond.value !== "boolean")
  ) {
    return undefined;
  }
  return {
    field: cond.fieldId,
    value: cond.value,
  };
};

const toItem = (
  schemaGroup: PropertySchemaGroupFragmentFragment,
  item?: PropertyItemFragmentFragment,
  merged?: MergedPropertyGroupFragmentFragment | MergedPropertyGroupCommonFragmentFragment,
): Item | undefined => {
  const common: Pick<
    Item,
    "id" | "schemaGroup" | "title" | "only" | "schemaFields" | "representativeField"
  > = {
    id: item?.id,
    schemaGroup: schemaGroup.schemaGroupId,
    title: schemaGroup.translatedTitle,
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
          name: f.translatedTitle,
          description: f.translatedDescription,
          only: toCond(f.isAvailableIf),
          choices: f.choices?.map(c => ({
            key: c.key,
            label: c.translatedTitle,
          })),
          ui: toUi(f.ui),
          min: f.min ?? undefined,
          max: f.max ?? undefined,
          isLinkable: linkableType.includes(t),
        };
      })
      .filter((f): f is SchemaField => !!f),
  };

  if (schemaGroup.isList) {
    const items = (item && "groups" in item ? item.groups : []).map((item2, i): GroupListItem => {
      const mergedGroup = merged && "groups" in merged ? merged.groups[i] : undefined;
      return {
        id: item2.id,
        fields: toFields(schemaGroup, item2, mergedGroup),
      };
    });
    return {
      ...common,
      items,
    };
  }

  return {
    ...common,
    fields: toFields(schemaGroup, item, merged),
  };
};

const toFields = (
  schemaGroup: PropertySchemaGroupFragmentFragment,
  item?: PropertyItemFragmentFragment,
  merged?: MergedPropertyGroupFragmentFragment | MergedPropertyGroupCommonFragmentFragment,
) =>
  schemaGroup.fields
    .map(
      f =>
        [
          f,
          item && "fields" in item ? item.fields.find(f2 => f2.fieldId === f.fieldId) : undefined,
          merged?.fields.find(f2 => f2.fieldId === f.fieldId),
        ] as const,
    )
    .map(f => toField(f[0], f[1], f[2]))
    .filter((f): f is Field => !!f);

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

const toField = (
  schemaField: Pick<PropertySchemaField, "fieldId" | "type">,
  field?: Pick<PropertyField, "fieldId" | "value"> & {
    links?: Links;
  },
  merged?: Pick<MergedPropertyField, "fieldId" | "actualValue" | "overridden"> & {
    links?: Links;
  },
): Field | undefined => {
  if (
    (!field && !merged) ||
    (field && field.fieldId !== schemaField.fieldId) ||
    (merged && merged.fieldId !== schemaField.fieldId)
  ) {
    return;
  }

  const type = valueTypeFromGQL(schemaField.type);
  if (!type) return;
  const value = valueFromGQL(field?.value, schemaField.type);
  const mergedValue = valueFromGQL(merged?.actualValue, schemaField.type);
  const links = merged?.links ?? field?.links ?? undefined;

  return {
    id: schemaField.fieldId,
    type,
    value: value?.value,
    mergedValue: mergedValue?.value,
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
            fieldName: links[0].datasetSchemaField?.name ?? undefined,
          }
        : undefined,
  };
};

export const convert = (
  property: PropertyFragmentFragment | null | undefined,
  merged?: MergedPropertyFragmentFragment | null,
) => {
  if (!property || !property.schema) return;
  const {
    items,
    schema: { groups: schemaGroups },
  } = property;

  return schemaGroups
    .map(g => {
      const item = items.find(i => i.schemaGroupId === g.schemaGroupId);
      const mergedGroup = merged?.groups.find(i => i.schemaGroupId === g.schemaGroupId);
      return toItem(g, item, mergedGroup);
    })
    .filter((g): g is Item => !!g);
};

const toUi = (ui: PropertySchemaFieldUi | null | undefined): SchemaField["ui"] => {
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
    case PropertySchemaFieldUi.Selection:
      return "selection";
    case PropertySchemaFieldUi.Video:
      return "video";
    case PropertySchemaFieldUi.Layer:
      return "layer";
    case PropertySchemaFieldUi.CameraPose:
      return "cameraPose";
  }
  return undefined;
};

export const convertLinkableDatasets = (
  data?: GetLinkableDatasetsQuery,
): DatasetSchema[] | undefined => {
  return (
    data?.datasetSchemas?.nodes as GetLinkableDatasetsQuery["datasetSchemas"]["nodes"] | undefined
  )
    ?.map((s): DatasetSchema | undefined => {
      return s
        ? {
            id: s.id,
            name: s.name,
            fields: s.fields
              .map((f): DatasetField | undefined => {
                const t = valueTypeFromGQL(f.type);
                return t ? { id: f.id, name: f.name, type: t } : undefined;
              })
              .filter((f): f is DatasetField => !!f),
            datasets: s.datasets?.nodes
              .map((ds): Dataset | undefined =>
                ds
                  ? {
                      id: ds.id,
                      name: ds.name ?? undefined,
                    }
                  : undefined,
              )
              .filter((ds): ds is Dataset => !!ds),
          }
        : undefined;
    })
    .filter((s): s is DatasetSchema => !!s);
};

type GQLLayer = Omit<NonNullable<GetLayersFromLayerIdQuery["layer"]>, "layers"> & {
  linkedDatasetSchemaId?: string | null;
  linkedDatasetId?: string | null;
  layers?: (GQLLayer | null | undefined)[];
};

export function convertLayers(data: GetLayersFromLayerIdQuery | undefined): Layer[] {
  const layers = data?.layer?.__typename === "LayerGroup" ? data.layer.layers : [];

  function mapper(layer: Maybe<GQLLayer> | undefined): Layer | undefined {
    if (!layer) return undefined;
    return {
      id: layer.id,
      title: layer.name,
      visible: layer.isVisible,
      linked: !!layer.linkedDatasetSchemaId,
      ...(layer.__typename === "LayerGroup"
        ? {
            group: true,
            children: layer.layers
              ?.map(mapper)
              .filter((l): l is Layer => !!l)
              .reverse(),
          }
        : {
            group: false,
            linked: !!layer.linkedDatasetId,
            icon: layer.pluginId === "reearth" ? layer.extensionId ?? undefined : undefined,
          }),
    };
  }

  return layers
    .map(mapper)
    .filter((l): l is Layer => !!l)
    .reverse();
}
