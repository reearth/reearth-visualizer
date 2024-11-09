import Visualizer from "@reearth/beta/features/Visualizer";
import { useNotification } from "@reearth/services/state";
import * as yaml from "js-yaml";
import { ComponentProps, useCallback, useState } from "react";

import { WidgetLocation } from "../../Visualizer/Crust/Widgets/types";
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
      defaultLocation: {
        zone: WidgetLocation["zone"];
        section: WidgetLocation["section"];
        area: WidgetLocation["area"];
      };
    };
  }[];
};

type Props = {
  files: FileType[];
};

const getYmlJson = (
  file: FileType
):
  | {
      success: true;
      data: ReearthYML;
    }
  | {
      success: false;
      message: string;
    } => {
  try {
    return {
      success: true,
      data: yaml.load(file.sourceCode) as ReearthYML
    };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: "Failed to parse YAML"
    };
  }
};

export default ({ files }: Props) => {
  const [widgets, setWidgets] = useState<Widgets>();
  const [, setNotification] = useNotification();

  const executeCode = useCallback(() => {
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
        const file = files.find((file) => file.title === `${cur.id}.js`);

        if (!file) {
          return prv;
        }

        const { zone, section, area } = cur.widgetLayout?.defaultLocation ?? {
          zone: "outer",
          section: "left",
          area: "top"
        };

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
                      id: cur.id,
                      __REEARTH_SOURCECODE: file.sourceCode
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
  }, [files, setNotification]);

  return {
    executeCode,
    widgets
  };
};
