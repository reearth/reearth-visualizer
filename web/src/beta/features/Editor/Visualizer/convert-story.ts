import { Story, StoryBlock, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";
import { valueFromGQL, valueTypeFromGQL } from "@reearth/beta/utils/value";
import { toUi } from "@reearth/services/api/propertyApi/utils";
import { Scene } from "@reearth/services/api/sceneApi";
import {
  PropertyFieldFragmentFragment,
  PropertyFragmentFragment,
  PropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  PropertySchemaFieldFragmentFragment,
  PropertySchemaGroupFragmentFragment,
  StoryPage as GqlStoryPage,
  StoryBlock as GqlStoryBlock,
} from "@reearth/services/gql";

import { DatasetMap, P, datasetValue } from "./convert";

export const convertStory = (scene?: Scene, storyId?: string): Story | undefined => {
  const story = scene?.stories.find(s => s.id === storyId);
  const installedBlockNames = (scene?.plugins ?? [])
    .flatMap(p =>
      (p.plugin?.extensions ?? [])
        .filter(e => e.type === "StoryBlock")
        .map(e => ({ [e.extensionId]: e.translatedName ?? e.name }))
        .filter((e): e is { [key: string]: string } => !!e),
    )
    .reduce((result, obj) => ({ ...result, ...obj }), {});

  if (!story) return undefined;

  const storyPages = (pages: GqlStoryPage[]): StoryPage[] =>
    pages.map(p => ({
      id: p.id,
      title: p.title,
      propertyId: p.propertyId,
      layerIds: p.layersIds,
      property: processProperty(undefined, p.property),
      blocks: storyBlocks(p.blocks),
    }));
  const storyBlocks = (blocks: GqlStoryBlock[]): StoryBlock[] =>
    blocks.map(b => ({
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      name: installedBlockNames?.[b.extensionId] ?? "Story Block",
      propertyId: b.property?.id,
      property: processProperty(undefined, b.property),
    }));

  return {
    id: story.id,
    title: story.title,
    position: story.panelPosition === "RIGHT" ? "right" : "left",
    bgColor: story.bgColor || "#f1f1f1",
    pages: storyPages(story.pages),
  };
};

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
        if (!orig && !parent) {
          if (schema.isList) {
            return [key, undefined];
          }
          return [
            key,
            processPropertyGroups(schema, undefined, undefined, linkedDatasetId, datasets),
          ];
        }

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
            value: datasetValue(datasets, datasetSchemaId, linkedDatasetId, datasetFieldId),
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
