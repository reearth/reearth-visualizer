import { PrimitiveItem } from "@reearth/components/molecules/EarthEditor/DatasetInfoPane";
import {
  DatasetFragmentFragment,
  Maybe,
  PluginExtensionType,
  PluginFragmentFragment,
} from "@reearth/gql";

const excludePrimitiveType = ["polyline", "polygon", "rect"];

export const processDatasets = (
  rawDatasets: Maybe<DatasetFragmentFragment | undefined>[] | undefined,
): { [key: string]: string }[] => {
  return rawDatasets
    ? rawDatasets
        .filter((r): r is DatasetFragmentFragment => !!r)
        .map(r => processDataset(r.fields))
    : [];
};

const processDataset = (fields: DatasetFragmentFragment["fields"]): { [key: string]: string } => {
  const datasetFields = fields
    .map((f): [string, string] | undefined => {
      if (!f || !f.field) return undefined;
      return [
        f.field.name,
        String(typeof f.value === "object" && "lat" in f.value ? Object.values(f.value) : f.value),
      ];
    })
    .filter((f): f is [string, string] => !!f);
  return Object.fromEntries(datasetFields);
};

export const processDatasetHeaders = (
  rawDatasets: Maybe<DatasetFragmentFragment | undefined>[] | undefined,
): string[] => {
  const headers =
    rawDatasets?.flatMap(
      d => d?.fields.map(f => f.field?.name).filter((f): f is string => !!f) || [],
    ) || [];
  return Array.from(new Set(headers));
};

export const processPrimitives = (
  rawPlugins: Maybe<PluginFragmentFragment | undefined>[],
): PrimitiveItem[] => {
  const primitiveItems =
    rawPlugins
      .flatMap(p =>
        p?.extensions
          .filter(e => e.type === PluginExtensionType.Primitive)
          .filter(e => !excludePrimitiveType.includes(e.extensionId))
          .map(e => ({ name: e.name, extensionId: e.extensionId, icon: e.icon, pluginId: p.id })),
      )
      .filter((e): e is PrimitiveItem => !!e) || [];
  return primitiveItems;
};
