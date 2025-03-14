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

// Define UI for modal window
const modalContent= \`<style>
  h2,
  h3 {
    margin: 0;
    font-family: Arial, sans-serif;
  }
  h2,
  h3 {
    text-align: center;
    margin: 20px;
  }
  #wrapper {
    background: #eee;
    color: #222;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  #wrapper p {
    text-align: center;
  }
  .flex-center {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .close-btn {
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px;
    background: #ffffff;
    border: 1px solid #808080;
  }
  .close-btn:active {
    background: #dcdcdc;
  }
  </style>

<div id="wrapper">
  <h3>🌎 Hello World 🌎</h3>
  <p>Re:Earth Visualizer allows you to set up a modal window. Click the button below to close the modal window.</p>
  <div class="flex-center">
    <button class="close-btn"
    onclick="window.parent.postMessage({ action: 'closeModal' }, '*')"
    >
      Let's go to Visualizer
    </button>
  </div>
</div>\`

// Set a modal window
reearth.modal.show(modalContent, {
  width: 400, // Define window width
  height: 300, // Define window height
  background: "#f8f8f880", // Define background color
  clickBgToClose: false, // Determines whether clicking on the modal background will close the modal. Set to true to enable this feature, otherwise, it defaults to false.
});

// Listen for a message from the modal window and close it
reearth.extension.on("message", msg => {
  if (msg.action === "closeModal") {
    // Close a modal window
    reearth.modal.close();
  }
});`
};

export const modalWindow: PluginType = {
  id: "modal-window",
  files: [yamlFile, widgetFile]
};
