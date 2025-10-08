import { useNotification } from "@reearth/services/state";
import { merge } from "lodash-es";
import { useCallback, useState } from "react";

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
    const groupProperty: Record<string, FieldValue> = {};
    group.fields.forEach((field) => {
      const id = `${pluginId}-${extensionId}-${group.id}-${field.id}`;
      groupProperty[field.id] = fieldValues[id] ?? field.defaultValue;
    });
    property[group.id] = groupProperty;
  });

  return property;
}

export default ({
  files,
  fieldValues,
  resetVisualizer
}: Props): HookReturnType => {
  const [infoboxBlocks, setInfoboxBlocks] = useState<CustomInfoboxBlock[]>();
  const [story, setStory] = useState<Story>();
  const [widgets, setWidgets] = useState<Widgets>(defaultWidgets);

  const [, setNotification] = useNotification();

  const executeCode = useCallback(() => {
    resetVisualizer();
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
                      __REEARTH_SOURCECODE: file.sourceCode,
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

    merge(widgets, defaultWidgets);

    setWidgets(widgets);

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
          __REEARTH_SOURCECODE: file.sourceCode,
          extensionId: cur.id,
          pluginId: ymlJson.id,
          extensionType: "infoboxBlock",
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
        __REEARTH_SOURCECODE: file.sourceCode,
        extensionId: cur.id,
        pluginId: ymlJson.id,
        extensionType: "storyBlock",
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
  }, [files, fieldValues, resetVisualizer, setNotification]);

  return {
    executeCode,
    infoboxBlocks,
    story,
    widgets
  };
};
