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

export default ({ files }: Props) => {
  const [widgets, setWidgets] = useState<Widgets>();
  const [, setNotification] = useNotification();
  const [fileOutputs, setFileOutputs] = useState<
    {
      title: string;
      output: string;
    }[]
  >();

  const executeCode = useCallback(() => {
    const ymlFile = files.find((file) => file.title.endsWith(".yml"));

    const jsFiles = files.filter((file) => file.title.endsWith(".js"));

    const outputs = jsFiles.map((file) => {
      try {
        const fn = new Function(
          `"use strict";
          const reearth = {
            ui: {
              show: function () {}
            },
            popup: {
              show: function () {}
            },
            modal: {
              show: function () {}
            }
          };
        
          let capturedConsole = [];
        
          console.log = (message) => {
            capturedConsole.push(message);
          };
        
          console.error = (message) => {
            capturedConsole.push(message);
          };
        
          ${file.sourceCode};
          
          return capturedConsole.join("\\n");
          `
        );

        return {
          title: file.title,
          output: fn()
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            title: file.title,
            output: error.message
          };
        }
        return {
          title: file.title,
          output: "Failed to execute"
        };
      }
    });

    setFileOutputs(outputs);

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
    widgets,
    fileOutputs
  };
};
