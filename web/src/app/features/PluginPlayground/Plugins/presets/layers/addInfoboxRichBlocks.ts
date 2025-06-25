import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-infobox-rich-block-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: add-infobox-rich-block
name: Add Infobox Rich Blocks
version: 1.0.0
extensions:
  - id: add-infobox-rich-block
    type: widget
    name: Add Infobox Rich Blocks Widget
    description: Add Infobox Rich Blocks Widget
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "add-infobox-rich-block",
  title: "add-infobox-rich-block.js",
  sourceCode: `// This example shows how to activate Infobox that display text, image, markdown and video blocks

// FOSS4G event data for Japan in 2024
reearth.layers.add({
  type: "simple",
  data: {
    type: "csv",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/csv/foss4g_japan.csv",
    csv: {
      // Define by column name
      lngColumn: "lng",
      latColumn: "lat"
    }
  },
  // Display infobox
  infobox: {
    blocks: [
      {
        // Add text block
        pluginId: "reearth",
        extensionId: "textInfoboxBetaBlock",
        property: {
          default: {
            text: {
              value: "\${event_name}"
            }
          }
        }
      },
      {
	      // Add image block
        pluginId: "reearth",
        extensionId: "imageInfoboxBetaBlock",
        property: {
          default: {
            src: {
              value: "\${image_url}"
            }
          }
        }
      },
      {
	      // Add markdown block
        pluginId: "reearth",
        extensionId: "markdownInfoboxBetaBlock",
        property: {
          default: {
            src: {
              value: "\${description}"
            }
          }
        }
      },
      {
	      // Add video block
        pluginId: "reearth",
        extensionId: "videoInfoboxBetaBlock",
        property: {
            "default": {
                src: {
                    value: "\${video_url}"
                }
            }
        },
      }
    ]
  },
  marker: {
    style: "point",
    pointColor: "#49A85A",
    pointSize: 15,
    pointOutlineColor: "white",
    pointOutlineWidth: 2
  },
});

// Move the camera to the position where the csv data is displayed.
reearth.camera.setView({
  "lat": 36.5963,
  "lng": 139.7982,
  "height": 1100000,
  "heading": 0,
  "pitch": -1.37,
  "roll": 0
});
`
};

export const addInfoboxRichBlocks: PluginType = {
  id: "add-infobox-rich-block",
  files: [yamlFile, widgetFile]
};
