import { MapRef } from "@reearth/core";
import { useNotification } from "@reearth/services/state";
import { RefObject, useCallback, useRef, useState } from "react";

import { Story } from "../../Visualizer/Crust/StoryPanel/types";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";
import { FileType } from "../Plugins/constants";
import {
  CustomInfoboxBlock,
  CustomSchemaField,
  CustomStoryBlock,
  FieldValue,
  Group,
  Widgets
} from "../types";
import { getYmlJson } from "../utils";

type Props = {
  files: FileType[];
  fieldValues: Record<string, FieldValue>;
  resetVisualizer: () => void;
  /** Lets a run that only changes property values keep the map. */
  visualizerRef?: RefObject<MapRef | null>;
};

type HookReturnType = {
  executeCode: () => void;
  infoboxBlocks?: CustomInfoboxBlock[];
  schemaFields?: CustomSchemaField[];
  story?: Story;
  widgets?: Widgets;
};

const defaultWidgets = {
  alignSystem: {
    outer: {
      left: {
        bottom: {
          widgets: [
            {
              id: `reearth-data-attribution`,
              extensionId: "dataAttribution",
              pluginId: "reearth"
            }
          ]
        }
      }
    }
  },
  floating: [],
  ownBuiltinWidgets: []
};

// A plugin reruns when its source changes, so marking the source with the run
// count reruns every plugin on the map as it is.
const markRun = (sourceCode: string, run: number) =>
  run ? `${sourceCode}\n//# reearth-playground-run=${run}` : sourceCode;

function generateProperty(
  schema:
    | {
        groups: Group;
      }
    | undefined,
  fieldValues: Record<string, FieldValue>,
  pluginId: string,
  extensionId: string
) {
  const property: Record<string, unknown> = {};
  if (!schema || !schema.groups) return property;

  schema.groups.forEach((group) => {
    const isList = "list" in group && !!group.list;
    const base = `${pluginId}-${extensionId}-${group.id}`;

    if (isList) {
      // List groups store items as flat keys keyed by itemId. Read the stored
      // order and build an array so the plugin receives property[groupId] as
      // an array rather than a plain object.
      const orderKey = `${base}-__order`;
      const raw = fieldValues[orderKey];
      const itemIds: string[] = Array.isArray(raw) ? (raw as string[]) : [];

      property[group.id] = itemIds.map((itemId) => {
        const itemProperty: Record<string, FieldValue> = {};
        group.fields.forEach((field) => {
          const key = `${base}-${itemId}-${field.id}`;
          itemProperty[field.id] = fieldValues[key] ?? field.defaultValue;
        });
        return itemProperty;
      });
    } else {
      const groupProperty: Record<string, FieldValue> = {};
      group.fields.forEach((field) => {
        const id = `${base}-${field.id}`;
        groupProperty[field.id] = fieldValues[id] ?? field.defaultValue;
      });
      property[group.id] = groupProperty;
    }
  });

  return property;
}

export default ({
  files,
  fieldValues,
  resetVisualizer,
  visualizerRef
}: Props): HookReturnType => {
  const [infoboxBlocks, setInfoboxBlocks] = useState<CustomInfoboxBlock[]>();
  const [story, setStory] = useState<Story>();
  const [widgets, setWidgets] = useState<Widgets>(defaultWidgets);

  const [, setNotification] = useNotification();
  const lastRun = useRef<{ source: string; count: number }>(undefined);

  const executeCode = useCallback(() => {
    // Remounting the map blanks it while the globe loads again, so it's done
    // only when the code changed. The first run, or a run with the same code
    // (e.g. after editing a property), reruns the plugins on the map as it is,
    // without what earlier runs added to it.
    const source = files.map((f) => `${f.title}\0${f.sourceCode}`).join("\0");
    const map = visualizerRef?.current;
    const keepMap =
      !!map && (!lastRun.current || lastRun.current.source === source);
    if (keepMap) {
      const layers = map?.layers;
      const added = layers
        ?.layers?.()
        ?.filter((l) => layers.isTempLayer?.(l.id))
        .map((l) => l.id);
      if (added?.length) layers?.deleteLayer?.(...added);
    } else {
      resetVisualizer();
    }
    const run = keepMap && lastRun.current ? lastRun.current.count + 1 : 0;
    lastRun.current = { source, count: run };

    const ymlFile = files.find((file) => file.title.endsWith(".yml"));

    if (!ymlFile) return;

    const getYmlResult = getYmlJson(ymlFile);

    if (!getYmlResult.success) {
      setNotification({ type: "error", text: getYmlResult.message });
      return;
    }

    const ymlJson = getYmlResult.data;

    if (!ymlJson.extensions) return;

    const widgets = ymlJson.extensions.reduce<NonNullable<Widgets>>(
      (prv, cur) => {
        if (cur.type !== "widget") return prv;

        const file = files.find((file) => file.title === `${cur.id}.js`);

        if (!file) {
          return prv;
        }

        const { zone, section, area } = cur.widgetLayout?.defaultLocation ?? {
          zone: "outer",
          section: "left",
          area: "top"
        };

        const extended = cur.widgetLayout?.extended ?? false;

        const zoneAlignSystem = prv?.alignSystem?.[zone] ?? {};
        const sectionAlignSystem = zoneAlignSystem[section] ?? {};
        const areaAlignSystem = sectionAlignSystem[area] ?? { widgets: [] };

        return {
          ...prv,
          alignSystem: {
            ...prv?.alignSystem,
            [zone]: {
              ...zoneAlignSystem,
              [section]: {
                ...sectionAlignSystem,
                [area]: {
                  ...areaAlignSystem,
                  widgets: [
                    ...(areaAlignSystem.widgets ?? []),
                    {
                      id: `${ymlJson.id}-${cur.id}`,
                      name: cur.name,
                      extensionId: cur.id,
                      pluginId: ymlJson.id,
                      property: generateProperty(
                        cur.schema,
                        fieldValues,
                        ymlJson.id,
                        cur.id
                      ),
                      __REEARTH_SOURCECODE: markRun(file.sourceCode, run),
                      extended
                    }
                  ]
                }
              }
            }
          }
        };
      },
      {
        alignSystem: {},
        floating: [],
        ownBuiltinWidgets: []
      }
    );

    // The built-in widgets go after the plugin's own in the same area. lodash's
    // merge would combine the lists by index and replace the plugin's first
    // widget there.
    setWidgets({
      ...widgets,
      alignSystem: {
        ...widgets.alignSystem,
        outer: {
          ...widgets.alignSystem?.outer,
          left: {
            ...widgets.alignSystem?.outer?.left,
            bottom: {
              ...widgets.alignSystem?.outer?.left?.bottom,
              widgets: [
                ...(widgets.alignSystem?.outer?.left?.bottom?.widgets ?? []),
                ...defaultWidgets.alignSystem.outer.left.bottom.widgets
              ]
            }
          }
        }
      }
    });

    const infoboxBlockFromExtension = ymlJson.extensions.reduce<
      CustomInfoboxBlock[]
    >((prv, cur) => {
      if (cur.type !== "infoboxBlock") return prv;

      const file = files.find((file) => file.title === `${cur.id}.js`);

      if (!file) {
        return prv;
      }

      return [
        ...prv,
        {
          id: `${ymlJson.id}-${cur.id}`,
          name: cur.name,
          description: cur.description,
          __REEARTH_SOURCECODE: markRun(file.sourceCode, run),
          extensionId: cur.id,
          pluginId: ymlJson.id,
          extensionType: "infoboxBlock",
          property: generateProperty(
            cur.schema,
            fieldValues,
            ymlJson.id,
            cur.id
          ),
          propertyForPluginAPI: generateProperty(
            cur.schema,
            fieldValues,
            ymlJson.id,
            cur.id
          )
        }
      ];
    }, []);

    setInfoboxBlocks(infoboxBlockFromExtension);

    const storyBlocksFromExtension = ymlJson.extensions.reduce<
      CustomStoryBlock[]
    >((prv, cur) => {
      if (cur.type !== "storyBlock") return prv;

      const file = files.find((file) => file.title === `${cur.id}.js`);

      if (!file) {
        return prv;
      }

      prv.push({
        id: `${ymlJson.id}-${cur.id}`,
        name: cur.name,
        description: cur.description,
        __REEARTH_SOURCECODE: markRun(file.sourceCode, run),
        extensionId: cur.id,
        pluginId: ymlJson.id,
        extensionType: "storyBlock",
        property: generateProperty(cur.schema, fieldValues, ymlJson.id, cur.id),
        propertyForPluginAPI: generateProperty(
          cur.schema,
          fieldValues,
          ymlJson.id,
          cur.id
        )
      });
      return prv;
    }, []);

    setStory({
      id: "story",
      title: "First Story",
      position: "left",
      bgColor: "#f0f0f0",
      pages: [
        {
          id: "page",
          blocks: storyBlocksFromExtension,
          layerIds: DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((l) => l.id)
        }
      ]
    });
  }, [files, fieldValues, resetVisualizer, setNotification, visualizerRef]);

  return {
    executeCode,
    infoboxBlocks,
    story,
    widgets
  };
};
