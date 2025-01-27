import Visualizer from "@reearth/beta/features/Visualizer";
import { useNotification } from "@reearth/services/state";
import * as yaml from "js-yaml";
import { ComponentProps, useCallback, useState } from "react";
import { v4 } from "uuid";

import { Story } from "../../Visualizer/Crust/StoryPanel/types";
import { WidgetLocation } from "../../Visualizer/Crust/Widgets/types";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";
import { FileType } from "../Plugins/constants";

type Widgets = ComponentProps<typeof Visualizer>["widgets"];

type ReearthYML = {
  id: string;
  name: string;
  version: string;
  extensions?: {
    id: string;
    type: string;
    name: string;
    description: string;
    widgetLayout?: {
      extended: boolean;
      defaultLocation: {
        zone: WidgetLocation["zone"];
        section: WidgetLocation["section"];
        area: WidgetLocation["area"];
      };
    };
  }[];
};

type CustomInfoboxBlock = {
  id: string;
  name: string;
  description: string;
  __REEARTH_SOURCECODE: string;
  extensionId: string;
  pluginId: string;
};

type CustomStoryBlock = CustomInfoboxBlock;

type Props = {
  files: FileType[];
  resetVisualizer: () => void;
};

const getYmlJson = (file: FileType) => {
  if (file.sourceCode === "") {
    return { success: false, message: "YAML file is empty" } as const;
  }

  try {
    const data = yaml.load(file.sourceCode) as ReearthYML;
    return { success: true, data } as const;
  } catch (error) {
    const message =
      error instanceof yaml.YAMLException
        ? error.message
        : "Failed to parse YAML";
    return { success: false, message } as const;
  }
};

export default ({ files, resetVisualizer }: Props) => {
  const [infoboxBlocks, setInfoboxBlocks] = useState<CustomInfoboxBlock[]>();
  const [story, setStory] = useState<Story>();
  const [widgets, setWidgets] = useState<Widgets>();
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
  }, [files, resetVisualizer, setNotification]);

  return {
    executeCode,
    infoboxBlocks,
    story,
    widgets
  };
};
