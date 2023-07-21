import { valueTypeFromGQL } from "@reearth/beta/utils/value";

import {
  PropertyFieldFragmentFragment,
  PropertyFragmentFragment,
  PropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  PropertySchemaFieldFragmentFragment,
  PropertySchemaGroupFragmentFragment,
  ValueType as GQLValueType,
} from "../../gql";

export type Datasets = {
  // JSON schema
  schema: {
    $schema: string;
    $id: string;
    properties: Record<
      string,
      {
        $id: string;
      }
    >;
  };
  datasets: Record<string, any>[];
};

export type DatasetMap = Record<string, Datasets>;

type P = { [key in string]: any };

export const processProperty = (
  parent: PropertyFragmentFragment | null | undefined,
  orig?: PropertyFragmentFragment | null | undefined,
  linkedDatasetId?: string | null | undefined,
  datasets?: DatasetMap | null | undefined,
): P | undefined => {
  const schema = orig?.schema || parent?.schema;
  if (!schema) return;

  const allItems: Record<
    string,
    {
      schema: PropertySchemaGroupFragmentFragment;
      orig?: PropertyItemFragmentFragment;
      parent?: PropertyItemFragmentFragment;
    }
  > = schema.groups.reduce(
    (a, b) => ({
      ...a,
      [b.schemaGroupId]: {
        schema: b,
        orig: orig?.items.find(i => i.schemaGroupId === b.schemaGroupId),
        parent: parent?.items.find(i => i.schemaGroupId === b.schemaGroupId),
      },
    }),
    {},
  );

  const mergedProperty: P = Object.fromEntries(
    Object.entries(allItems)
      .map(([key, value]) => {
        const { schema, orig, parent } = value;
        if (
          (!orig || orig.__typename === "PropertyGroupList") &&
          (!parent || parent.__typename === "PropertyGroupList")
        ) {
          const used = orig || parent;
          return [
            key,
            used?.groups.map(g => ({
              ...processPropertyGroups(schema, g, undefined, linkedDatasetId, datasets),
              id: g.id,
            })),
          ];
        }

        if (
          (!orig || orig.__typename === "PropertyGroup") &&
          (!parent || parent.__typename === "PropertyGroup")
        ) {
          return [key, processPropertyGroups(schema, parent, orig, linkedDatasetId, datasets)];
        }
        return [key, null];
      })
      .filter(([, value]) => !!value),
  );

  return mergedProperty;
};

const processPropertyGroups = (
  schema: PropertySchemaGroupFragmentFragment,
  parent: PropertyGroupFragmentFragment | null | undefined,
  original: PropertyGroupFragmentFragment | null | undefined,
  linkedDatasetId: string | null | undefined,
  datasets: DatasetMap | null | undefined,
): any => {
  const allFields: Record<
    string,
    {
      schema: PropertySchemaFieldFragmentFragment;
      parent?: PropertyFieldFragmentFragment;
      orig?: PropertyFieldFragmentFragment;
    }
  > = schema.fields.reduce(
    (a, b) => ({
      ...a,
      [b.fieldId]: {
        schema: b,
        parent: parent?.fields.find(i => i.fieldId === b.fieldId),
        orig: original?.fields.find(i => i.fieldId === b.fieldId),
      },
    }),
    {},
  );

  return Object.fromEntries(
    Object.entries(allFields)
      .map(([key, { parent, orig }]) => {
        const used = orig || parent;
        if (!used) return [key, null];

        const datasetSchemaId = used?.links?.[0]?.datasetSchemaId;
        const datasetFieldId = used?.links?.[0]?.datasetSchemaFieldId;
        if (datasetSchemaId && linkedDatasetId && datasetFieldId) {
          return [key, datasetValue(datasets, datasetSchemaId, linkedDatasetId, datasetFieldId)];
        }

        return [key, valueFromGQL(used.value, used.type)?.value];
      })
      .filter(([, value]) => typeof value !== "undefined" && value !== null),
  );
};

const datasetValue = (
  datasets: DatasetMap | null | undefined,
  datasetSchemaId: string,
  datasetId: string,
  fieldId: string,
) => {
  const dataset = datasets?.[datasetSchemaId];
  if (!dataset?.schema) return;

  const fieldName = Object.entries(dataset.schema.properties).find(([, v]) => {
    const id = v["$id"].split("/").slice(-1)[0];
    return id === fieldId;
  })?.[0];

  if (!fieldName) return;
  return dataset.datasets.find(d => d[""] === datasetId)?.[fieldName];
};

export const valueFromGQL = (val: any, type: GQLValueType) => {
  const t = valueTypeFromGQL(type);
  if (typeof val === "undefined" || val === null || !t) {
    return undefined;
  }
  const ok = typeof val !== "undefined" && val !== null;
  let newVal = val;
  if (t === "camera" && val && typeof val === "object" && "altitude" in val) {
    newVal = {
      ...val,
      height: val.altitude,
    };
  }
  if (
    t === "typography" &&
    val &&
    typeof val === "object" &&
    "textAlign" in val &&
    typeof val.textAlign === "string"
  ) {
    newVal = {
      ...val,
      textAlign: val.textAlign.toLowerCase(),
    };
  }
  return { type: t, value: newVal ?? undefined, ok };
};
