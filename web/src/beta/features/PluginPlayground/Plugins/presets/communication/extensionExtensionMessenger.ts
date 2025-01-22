import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "extension-extension-messenger-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: extension-extension-messenger-plugin
name: Extension Extension Messenger
version: 1.0.0
extensions:
  - id: extension-extension-messenger
    type: widget
    name: Extension Extension Messenger Widget
    description: Extension Extension Messenger Widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: center
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "extension-extension-messenger-widget",
  title: "extension-extension-messenger.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}

});`
};

export const extensionExtensionMessenger: PluginType = {
  id: "extension-extension-messenger",
  title: "Extension Extension Messenger",
  files: [widgetFile, yamlFile]
};
