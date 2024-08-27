import { valueFromGQL, valueTypeFromGQL } from "@reearth/beta/utils/value";
import { toUi } from "@reearth/services/api/propertyApi/utils";
import {
  PropertyFieldFragmentFragment,
  PropertyFragmentFragment,
  PropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  PropertySchemaFieldFragmentFragment,
  PropertySchemaGroupFragmentFragment,
} from "@reearth/services/gql";

import { DatasetMap, P, datasetValue } from "./convert";

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
        orig: orig?.items.find((i) => i.schemaGroupId === b.schemaGroupId),
        parent: parent?.items.find((i) => i.schemaGroupId === b.schemaGroupId),
      },
    }),
    {},
  );
  const mergedProperty: P = Object.fromEntries(
    Object.entries(allItems)
      .map(([key, value]) => {
        const { schema, orig, parent } = value;
        if (!orig && !parent) {
          if (schema.isList) {
            return [key, undefined];
          }
          return [
            key,
            processPropertyGroups(
              schema,
              undefined,
              undefined,
              linkedDatasetId,
              datasets,
            ),
          ];
        }

        if (
          (!orig || orig.__typename === "PropertyGroupList") &&
          (!parent || parent.__typename === "PropertyGroupList")
        ) {
          const used = orig || parent;
          return [
            key,
            used?.groups.map((g) => ({
              ...processPropertyGroups(
                schema,
                g,
                undefined,
                linkedDatasetId,
                datasets,
              ),
              id: g.id,
            })),
          ];
        }

        if (
          (!orig || orig.__typename === "PropertyGroup") &&
          (!parent || parent.__typename === "PropertyGroup")
        ) {
          return [
            key,
            processPropertyGroups(
              schema,
              parent,
              orig,
              linkedDatasetId,
              datasets,
            ),
          ];
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
        parent: parent?.fields.find((i) => i.fieldId === b.fieldId),
        orig: original?.fields.find((i) => i.fieldId === b.fieldId),
      },
    }),
    {},
  );

  return Object.fromEntries(
    Object.entries(allFields).map(([key, { schema, parent, orig }]) => {
      const used = orig || parent;

      const fieldMeta = {
        type: valueTypeFromGQL(schema.type) || undefined,
        ui: toUi(schema.ui) || undefined,
        title: schema.translatedTitle || undefined,
        description: schema.translatedDescription || undefined,
        choices: schema.choices || undefined,
        min: schema.min || undefined,
        max: schema.max || undefined,
      };

      if (!used) {
        return [
          key,
          {
            ...fieldMeta,
            value: schema.defaultValue
              ? valueFromGQL(schema.defaultValue, schema.type)?.value
              : undefined,
          },
        ];
      }

      const datasetSchemaId = used?.links?.[0]?.datasetSchemaId;
      const datasetFieldId = used?.links?.[0]?.datasetSchemaFieldId;
      if (datasetSchemaId && linkedDatasetId && datasetFieldId) {
        return [
          key,
          {
            ...fieldMeta,
            value: datasetValue(
              datasets,
              datasetSchemaId,
              linkedDatasetId,
              datasetFieldId,
            ),
          },
        ];
      }

      return [
        key,
        {
          ...fieldMeta,
          value: valueFromGQL(used.value, used.type)?.value,
        },
      ];
    }),
  );
};
