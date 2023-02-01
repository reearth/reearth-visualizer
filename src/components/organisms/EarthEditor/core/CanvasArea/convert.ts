import { Item } from "@reearth/components/atoms/ContentPicker";
import type {
  Block,
  BuiltinWidgets,
  InternalWidget,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
  Alignment,
  WidgetArea,
  WidgetSection,
  WidgetZone,
} from "@reearth/core/Crust";
import { isBuiltinWidget } from "@reearth/core/Crust";
import type { LegacyLayer, Tag } from "@reearth/core/mantle";
import type {
  GetBlocksQuery,
  Maybe,
  MergedPropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  MergedPropertyGroupCommonFragmentFragment,
  EarthLayerFragment,
  EarthLayerItemFragment,
  GetEarthWidgetsQuery,
  PropertyFragmentFragment,
  WidgetZone as WidgetZoneType,
  WidgetSection as WidgetSectionType,
  WidgetArea as WidgetAreaType,
  EarthLayer5Fragment,
} from "@reearth/gql";
import { valueFromGQL } from "@reearth/util/value";

type BlockType = Item & {
  pluginId: string;
  extensionId: string;
};

type P = { [key in string]: any };

const processPropertyGroup = (p?: PropertyItemFragmentFragment | null): P | P[] | undefined => {
  if (!p) return;
  if (p.__typename === "PropertyGroupList") {
    return p.groups
      .map(g => processPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (p.__typename === "PropertyGroup") {
    return p.fields.reduce<P>(
      (a, b) => ({
        ...a,
        [b.fieldId]: valueFromGQL(b.value, b.type)?.value,
      }),
      p.id ? { id: p.id } : {},
    );
  }
  return;
};

export const convertProperty = (p?: PropertyFragmentFragment | null): P | undefined => {
  if (!p) return;
  const items = "items" in p ? p.items : undefined;
  if (!items) return;

  return Array.isArray(items)
    ? items.reduce<any>(
        (a, b) => ({
          ...a,
          [b.schemaGroupId]: processPropertyGroup(b),
        }),
        {},
      )
    : undefined;
};

const processMergedPropertyGroup = (
  p?: MergedPropertyGroupFragmentFragment | MergedPropertyGroupCommonFragmentFragment | null,
): P | P[] | undefined => {
  if (!p) return;
  if ("groups" in p && p.groups.length) {
    return p.groups
      .map(g => processMergedPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (!p.fields.length) return;
  return p.fields.reduce<P>(
    (a, b) => ({
      ...a,
      [b.fieldId]: valueFromGQL(b.actualValue, b.type)?.value,
    }),
    {},
  );
};

const processMergedProperty = (
  p?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["property"]>,
): P | undefined => {
  if (!p) return;
  return p.groups.reduce<any>(
    (a, b) => ({
      ...a,
      [b.schemaGroupId]: processMergedPropertyGroup(b),
    }),
    {},
  );
};

const processInfobox = (infobox?: EarthLayerFragment["infobox"]): LegacyLayer["infobox"] => {
  if (!infobox) return;
  return {
    property: convertProperty(infobox.property),
    blocks: infobox.fields.map<Block>(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: convertProperty(f.property),
      propertyId: f.propertyId, // required by onBlockChange
    })),
  };
};

const processMergedInfobox = (
  infobox?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["infobox"]>,
): LegacyLayer["infobox"] | undefined => {
  if (!infobox) return;
  return {
    property: processMergedProperty(infobox.property),
    blocks: infobox.fields.map<Block & { propertyId?: string }>(f => ({
      id: f.originalId,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: processMergedProperty(f.property),
      propertyId: f.property?.originalId ?? undefined, // required by onBlockChange
    })),
  };
};

export const processLayer = (layer: EarthLayer5Fragment): LegacyLayer | undefined => {
  if (!layer) return;
  return {
    id: layer.id,
    pluginId: layer.pluginId ?? "",
    extensionId: layer.extensionId ?? "",
    isVisible: layer.isVisible,
    title: layer.name,
    property:
      layer.__typename === "LayerItem" ? processMergedProperty(layer.merged?.property) : undefined,
    propertyId: layer.propertyId ?? undefined,
    infobox:
      layer.__typename === "LayerItem"
        ? processMergedInfobox(layer.merged?.infobox)
        : processInfobox(layer.infobox),
    tags: processLayerTags(layer.tags),
    children:
      layer.__typename === "LayerGroup"
        ? layer.layers
            ?.map(l => processLayer((l as EarthLayer5Fragment) ?? undefined))
            .filter((l): l is LegacyLayer => !!l)
        : undefined,
  };
};

export const convertWidgets = (
  data: GetEarthWidgetsQuery | undefined,
):
  | {
      floatingWidgets: InternalWidget[];
      alignSystem: WidgetAlignSystem;
      layoutConstraint: { [w in string]: WidgetLayoutConstraint } | undefined;
      ownBuiltinWidgets: { [K in keyof BuiltinWidgets<boolean>]?: BuiltinWidgets<boolean>[K] };
    }
  | undefined => {
  if (!data || !data.node || data.node.__typename !== "Scene" || !data.node.widgetAlignSystem) {
    return undefined;
  }

  const layoutConstraint = data.node.plugins
    .map(p =>
      p.plugin?.extensions.reduce<{
        [w in string]: WidgetLayoutConstraint & { floating: boolean };
      }>(
        (b, e) =>
          e?.widgetLayout?.extendable
            ? {
                ...b,
                [`${p.pluginId}/${e.extensionId}`]: {
                  extendable: {
                    horizontally: e?.widgetLayout?.extendable.horizontally,
                    vertically: e?.widgetLayout?.extendable.vertically,
                  },
                  floating: !!e?.widgetLayout?.floating,
                },
              }
            : b,
        {},
      ),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const floatingWidgets = data.node.widgets
    .filter(w => w.enabled && layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
    .map(
      (w): InternalWidget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: convertProperty(w.property),
      }),
    );

  const widgets = data.node.widgets
    .filter(w => w.enabled && !layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
    .map(
      (w): InternalWidget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: convertProperty(w.property),
      }),
    );

  const widgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone => {
    return {
      left: widgetSection(zone?.left),
      center: widgetSection(zone?.center),
      right: widgetSection(zone?.right),
    };
  };

  const widgetSection = (section?: Maybe<WidgetSectionType>): WidgetSection => {
    return {
      top: widgetArea(section?.top),
      middle: widgetArea(section?.middle),
      bottom: widgetArea(section?.bottom),
    };
  };

  const widgetArea = (area?: Maybe<WidgetAreaType>): WidgetArea => {
    const align = area?.align.toLowerCase() as Alignment | undefined;
    const areaWidgets: InternalWidget[] | undefined = area?.widgetIds
      .map<InternalWidget | undefined>(w => widgets.find(w2 => w === w2.id))
      .filter((w): w is InternalWidget => !!w);
    return {
      align: align ?? "start",
      widgets: areaWidgets || [],
    };
  };

  const ownBuiltinWidgets = data.node.widgets.reduce<{
    [K in keyof BuiltinWidgets<boolean>]?: BuiltinWidgets<boolean>[K];
  }>((res, next) => {
    const id = `${next.pluginId}/${next.extensionId}`;
    return isBuiltinWidget(id)
      ? {
          ...res,
          [id]: true,
        }
      : res;
  }, {});

  return {
    floatingWidgets,
    alignSystem: {
      outer: widgetZone(data.node.widgetAlignSystem.outer),
      inner: widgetZone(data.node.widgetAlignSystem.inner),
    },
    layoutConstraint,
    ownBuiltinWidgets,
  };
};

export const convertToBlocks = (data?: GetBlocksQuery): BlockType[] | undefined => {
  return (data?.node?.__typename === "Scene" ? data.node.plugins : undefined)
    ?.map(plugin =>
      plugin.plugin?.extensions
        ?.filter(e => e && e.type === "BLOCK")
        .map<BlockType | undefined>(extension =>
          plugin.plugin
            ? {
                id: `${plugin.plugin.id}/${extension.extensionId}`,
                icon:
                  extension.icon ||
                  // for official plugin
                  (plugin.plugin.id === "reearth" && extension.extensionId.replace(/block$/, "")) ||
                  "plugin",
                name: extension.name,
                description: extension.description,
                pluginId: plugin.plugin.id,
                extensionId: extension.extensionId,
              }
            : undefined,
        )
        .filter((b): b is BlockType => !!b),
    )
    .filter((a): a is BlockType[] => !!a)
    .reduce((a, b) => [...a, ...b], []);
};

export function processLayerTags(
  tags: {
    tagId: string;
    tag?: Maybe<{ label: string }>;
    children?: { tagId: string; tag?: Maybe<{ label: string }> }[];
  }[],
): Tag[] {
  return tags.map(t => ({
    id: t.tagId,
    label: t.tag?.label ?? "",
    tags: t.children?.map(tt => ({ id: tt.tagId, label: tt.tag?.label ?? "" })),
  }));
}

export function processSceneTags(
  tags: {
    id: string;
    label: string;
    tags?: { id: string; label: string }[];
  }[],
): Tag[] {
  return tags.map(t => ({
    id: t.id,
    label: t.label ?? "",
    tags: t.tags?.map(tt => ({ id: tt.id, label: tt.label ?? "" })),
  }));
}
