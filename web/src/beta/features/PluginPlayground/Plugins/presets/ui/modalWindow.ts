import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "modal-window-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: modal-window-plugin
name: Set Modal Window
version: 1.0.0
extensions:
  - id: modal-window
    type: widget
    name: Set Modal Window
    description: Set Modal Window
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "modal-window",
  title: "modal-window.js",
  sourceCode: `// This example shows how to set a modal window //
  const modalContent= \`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background p-16 rounded-sm primary-shadow flex-column gap-16">
    <h3 class="text-center text-xl m-0">🌎 Hello World 🌎</h3>
    <p class="text-center">Re:Earth Visualizer allows you to set up a modal window. Click the button below to close the modal window.</p>
    <div class="flex-center">
      <button class="btn-neutral button-padding"
      onclick="window.parent.postMessage({ action: 'closeModal' }, '*')"
      >
        Let's go to Visualizer
      </button>
    </div>
  </div>\`

// Set a modal window
// Documentation for Modal "show" method https://visualizer.developer.reearth.io/plugin-api/modal/#show
reearth.modal.show(modalContent, {
  width: 400, // Define window width
  height: 300, // Define window height
  background: "#f8f8f880", // Define background color
  clickBgToClose: false, // Determines whether clicking on the modal background will close the modal. Set to true to enable this feature, otherwise, it defaults to false.
});

// Listen for a message from the modal window and close it
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", msg => {
  if (msg.action === "closeModal") {
    // Close a modal window
    // Documentation for Modal "close" method https://visualizer.developer.reearth.io/plugin-api/modal/#close
    reearth.modal.close();
  }
});`
};

export const modalWindow: PluginType = {
  id: "modal-window",
  files: [yamlFile, widgetFile]
};
