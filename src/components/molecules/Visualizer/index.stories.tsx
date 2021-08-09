import React, { useMemo, useState } from "react";
import { Meta, Story } from "@storybook/react";
import Component, { Primitive, Widget, Props } from ".";

export default {
  title: "molecules/Visualizer",
  component: Component,
  argTypes: {
    onBlockChange: { action: "onBlockChange" },
    onBlockDelete: { action: "onBlockDelete" },
    onBlockMove: { action: "onBlockMove" },
    onBlockInsert: { action: "onBlockInsert" },
    onBlockSelect: { action: "onBlockSelect" },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const primitives: Primitive[] = [
  {
    id: "1",
    pluginId: "reearth",
    extensionId: "marker",
    title: "hoge",
    isVisible: true,
    property: {
      default: {
        location: { lat: 35.3929, lng: 139.4428 },
        height: 0,
      },
    },
    infobox: {},
  },
  {
    id: "2",
    pluginId: "reearth",
    extensionId: "marker",
    title: "hoge",
    isVisible: true,
    infoboxEditable: true,
    property: {
      default: {
        location: { lat: 34.3929, lng: 139.4428 },
        height: 0,
      },
    },
    infobox: {
      blocks: [
        {
          id: "1",
          pluginId: "reearth",
          extensionId: "textblock",
          property: {
            default: {
              text: "```\naaaaa\n```",
              markdown: true,
            },
          },
        },
      ],
      property: {
        default: {
          title: "Foo",
          bgcolor: "#0ff",
        },
      },
    },
  },
];

const widgets: Widget[] = [
  {
    id: "a",
    pluginId: "reearth",
    extensionId: "splashscreen",
    property: {
      overlay: {
        overlayEnabled: true,
        overlayDuration: 2,
        overlayTransitionDuration: 1,
        overlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
        overlayImageW: 648,
        overlayImageH: 432,
        overlayBgcolor: "#fff8",
      },
    },
  },
];

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {
  engine: "cesium",
  rootLayerId: "root",
  primitives,
  widgets,
  sceneProperty: {
    tiles: [{ id: "default", tile_type: "default" }],
  },
  selectedPrimitiveId: undefined,
  selectedBlockId: undefined,
  ready: true,
  isEditable: true,
  isBuilt: false,
  small: false,
};

export const Selected = Template.bind({});
Selected.args = {
  ...Default.args,
  primitives: Default.args.primitives?.map(p => ({ ...p, infoboxEditable: true })),
  selectedPrimitiveId: primitives[1].id,
};

export const Built = Template.bind({});
Built.args = {
  ...Default.args,
  isEditable: false,
  isBuilt: true,
};

const initialSourceCode = `
console.log("hello", reearth.block);
reearth.ui.show("<style>body { margin: 0; background: #fff; }</style><h1>Hello World</h1>", { visible: true });
`.trim();

export const Plugin: Story<Props> = args => {
  const [temporalSourceCode, setTemporalSourceCode] = useState(initialSourceCode);
  const [sourceCode, setSourceCode] = useState(temporalSourceCode);
  const [temporalMode, setTemporalMode] = useState<"block" | "widget" | "primitive">("block");
  const [mode, setMode] = useState(temporalMode);

  const args2 = useMemo<Props>(() => {
    return {
      ...args,
      widgets: [
        ...(mode === "widget"
          ? [
              {
                id: "xxx",
                __REEARTH_SOURCECODE: sourceCode,
              },
            ]
          : []),
      ],
      primitives: [
        ...(args.primitives ?? []),
        {
          id: "pluginprimitive",
          pluginId: "reearth",
          extensionId: "marker",
          isVisible: true,
          property: {
            default: {
              location: { lat: 0, lng: 139 },
              height: 0,
            },
          },
          infobox: {
            blocks: [
              ...(mode === "block"
                ? [
                    {
                      id: "xxx",
                      __REEARTH_SOURCECODE: sourceCode,
                    },
                  ]
                : []),
              {
                id: "yyy",
                pluginId: "plugins",
                extensionId: "block",
                property: {
                  location: { lat: 0, lng: 139 },
                },
              },
            ],
          },
        },
        ...(mode === "primitive"
          ? [
              {
                id: "xxx",
                __REEARTH_SOURCECODE: sourceCode,
                isVisible: true,
                property: {
                  location: { lat: 0, lng: 130 },
                },
              },
            ]
          : []),
      ],
    };
  }, [args, mode, sourceCode]);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "stretch" }}>
      <Component {...args2} style={{ ...args2.style, flex: "1" }} />
      <div
        style={{
          flex: "1 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "#fff",
        }}>
        <textarea
          style={{ flex: "auto" }}
          value={temporalSourceCode}
          onChange={e => setTemporalSourceCode(e.currentTarget.value)}
        />
        <p>
          <button
            onClick={() => {
              setSourceCode(temporalSourceCode ?? "");
              setMode(temporalMode);
            }}>
            Exec
          </button>
          <select
            value={temporalMode}
            onChange={e =>
              setTemporalMode(e.currentTarget.value as "block" | "widget" | "primitive")
            }>
            <option value="block">Block</option>
            <option value="widget">Widget</option>
            <option value="primitive">Primitive</option>
          </select>
        </p>
      </div>
    </div>
  );
};
Plugin.args = {
  ...Default.args,
  selectedPrimitiveId: "pluginprimitive",
  pluginBaseUrl: process.env.PUBLIC_URL,
};
