import { SpacingValues } from "@reearth/beta/ui/fields/SpacingField";
import { useNotification } from "@reearth/services/state";
import { useCallback, useState } from "react";
import { v4 } from "uuid";

import { Story } from "../../Visualizer/Crust/StoryPanel/types";
import { LatLng } from "../../Visualizer/Crust/types";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";
import { FileType } from "../Plugins/constants";
import {
  CustomInfoboxBlock,
  CustomSchemaField,
  CustomStoryBlock,
  Widgets
} from "../types";
import { customSchemaFieldsToObject, getYmlJson } from "../utils";

type Props = {
  files: FileType[];
  resetVisualizer: () => void;
};

type HookReturnType = {
  executeCode: () => void;
  infoboxBlocks?: CustomInfoboxBlock[];
  schemaFields?: CustomSchemaField[];
  setSchemaFields: (fields: CustomSchemaField[]) => void;
  story?: Story;
  setUpdatedField: ({
    fieldId,
    value
  }: {
    fieldId: string;
    value:
      | boolean
      | LatLng
      | number
      | number[]
      | string
      | string[]
      | SpacingValues;
  }) => void;
  widgets?: Widgets;
};

export default ({ files, resetVisualizer }: Props): HookReturnType => {
  const [infoboxBlocks, setInfoboxBlocks] = useState<CustomInfoboxBlock[]>();
  const [story, setStory] = useState<Story>();
  const [widgets, setWidgets] = useState<Widgets>();
  const [schemaFields, setSchemaFields] = useState<CustomSchemaField[]>();
  const [updatedField, setUpdatedField] = useState<{
    fieldId: string;
    value:
      | boolean
      | LatLng
      | number
      | number[]
      | string
      | string[]
      | SpacingValues;
  }>();

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
                      id: v4(),
                      name: cur.name,
                      extensionId: cur.id,
                      pluginId: ymlJson.id,
                      property: customSchemaFieldsToObject(
                        schemaFields as CustomSchemaField[]
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
    setWidgets(widgets);

    const infoboBlockFromExtension = ymlJson.extensions.reduce<
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
          id: cur.id,
          name: cur.name,
          description: cur.description,
          __REEARTH_SOURCECODE: file.sourceCode,
          extensionId: cur.id,
          pluginId: cur.id
        }
      ];
    }, []);

    setInfoboxBlocks(infoboBlockFromExtension);

    const storyBlocksFromExtension = ymlJson.extensions.reduce<
      CustomStoryBlock[]
    >((prv, cur) => {
      if (cur.type !== "storyBlock") return prv;

      const file = files.find((file) => file.title === `${cur.id}.js`);

      if (!file) {
        return prv;
      }

      prv.push({
        id: cur.id,
        name: cur.name,
        description: cur.description,
        __REEARTH_SOURCECODE: file.sourceCode,
        extensionId: cur.id,
        pluginId: cur.id
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

    let schemaFieldsFromExtension = ymlJson.extensions.reduce<
      CustomSchemaField[]
    >((prv, cur) => {
      if (!cur.schema || !cur.schema.groups) return prv;

      return [...prv, ...cur.schema.groups.flatMap((g) => g.fields)];
    }, []);

    if (updatedField) {
      const updatedFieldIndex = schemaFieldsFromExtension.findIndex(
        (field) => field.id === updatedField.fieldId
      );

      if (updatedFieldIndex !== -1) {
        schemaFieldsFromExtension = [
          ...schemaFieldsFromExtension.slice(0, updatedFieldIndex),
          {
            ...schemaFieldsFromExtension[updatedFieldIndex],
            value: (updatedField.value as string) ?? ""
          },
          ...schemaFieldsFromExtension.slice(updatedFieldIndex + 1)
        ];
      }
    }

    setSchemaFields(schemaFieldsFromExtension);
  }, [updatedField, schemaFields, files, resetVisualizer, setNotification]);

  return {
    executeCode,
    infoboxBlocks,
    schemaFields,
    setSchemaFields,
    setUpdatedField,
    story,
    widgets
  };
};
