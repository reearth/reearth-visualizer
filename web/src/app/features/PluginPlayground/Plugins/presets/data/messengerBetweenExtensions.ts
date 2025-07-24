import { FileType, PluginType } from "../../constants";

// YAML File Definition
const yamlFile: FileType = {
  id: "messenger-between-extensions-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: messenger-between-extensions-plugin
name: Extension To Extension Messenger
version: 1.0.0
extensions:
  - id: extension-1
    type: widget
    name: Extension 1
    description: Extension 1 Widget
  - id: extension-2
    type: widget
    name: Extension 2
    description: Extension 2 Widget
`,
  disableEdit: true,
  disableDelete: true
};

// Extension 1 Widget Source Code
const extension1SourceCode = `
reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background p-16 rounded-sm flex-column gap-8">
    <p class="text-3xl font-bold">Extension 1</p>
    <div class="flex-center">
      <input id="messageInput" type="text" placeholder="Enter message"/>
      <button id="sendButton" class="btn-primary p-8">Send</button>
    </div>
    <p class="text-lg font-bold">Received Messages</p>
    <div class="secondary-background p-4 rounded-sm">
      <div id="messagesContainer" class="h-6"></div>
    </div>
  </div>

  <script>
   // Listen for UI button clicks and send message to extension
    document.getElementById("sendButton").addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      const message = input.value.trim();
      if (message) {
      // Send message from UI to extension
        parent.postMessage({ type: "send", message }, "*");
        input.value = "";
      }
    });

     // Listen for messages from extension to update UI
    window.addEventListener("message", (e) => {
      const msg = e.data;
      if (msg.type === "received") {
        const container = document.getElementById("messagesContainer");
        const div = document.createElement("div");
        div.textContent = msg.message;
        div.style.margin = "4px 0";
        container.appendChild(div);
      }
    });
  </script>
\`);

// Handle messages from UI to send to other extension
// Documentation on Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", msg => {
  if (msg.type === "send") {
  // Documentation on Extension List https://visualizer.developer.reearth.io/plugin-api/extension/#list
    const extensions = reearth.extension.list;
    const target = extensions.find(ext => ext.extensionId === "extension-2");
    if (target) {
    // Documentation on Extension "postMessage" method https://visualizer.developer.reearth.io/plugin-api/extension/#postmessage
      reearth.extension.postMessage(target.id, msg.message);
    }
  }
});

// Handle messages received from other extension
reearth.extension.on("extensionMessage", msg => {
  reearth.ui.postMessage({
    type: "received",
    message: msg.data
  });
});`;

// Extension 2 Widget Source Code
const extension2SourceCode = `
reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div class="primary-background p-16 rounded-sm flex-column gap-8">
    <p class="text-3xl font-bold">Extension 2</p>
    <div class="flex-center">
      <input id="messageInput" type="text" placeholder="Enter message"/>
      <button id="sendButton" class="btn-primary p-8">Send</button>
    </div>
    <p class="text-lg font-bold">Received Messages</p>
    <div class="secondary-background p-4 rounded-sm">
      <div id="messagesContainer" class="secondary-background rounded-sm h-6"></div>
    </div>
  </div>

  <script>
    document.getElementById("sendButton").addEventListener("click", () => {
      const input = document.getElementById("messageInput");
      const message = input.value.trim();
      if (message) {
        parent.postMessage({ type: "send", message }, "*");
        input.value = "";
      }
    });

    window.addEventListener("message", (e) => {
      const msg = e.data;
      if (msg.type === "received") {
        const container = document.getElementById("messagesContainer");
        const div = document.createElement("div");
        div.textContent = msg.message;
        div.style.margin = "4px 0";
        container.appendChild(div);
      }
    });
  </script>
\`);

// Note: Re:Earth visualizer requires using msg.data for message content
// and extensionId for finding extensions

// Handle messages from UI to send to other extension
reearth.extension.on("message", msg => {
  if (msg.type === "send") {
    const extensions = reearth.extension.list;
    const target = extensions.find(ext => ext.extensionId === "extension-1");
    if (target) {
      reearth.extension.postMessage(target.id, msg.message);
    }
  }
});

// Handle messages received from other extension
reearth.extension.on("extensionMessage", msg => {
  reearth.ui.postMessage({
    type: "received",
    message: msg.data
  });
});`;

// Widget File Definitions
const extension1File: FileType = {
  id: "messenger-between-extensions-extension1",
  title: "extension-1.js",
  sourceCode: extension1SourceCode
};

const extension2File: FileType = {
  id: "messenger-between-extensions-extension2",
  title: "extension-2.js",
  sourceCode: extension2SourceCode
};

// Plugin Definition
export const messengerBetweenExtensions: PluginType = {
  id: "messenger-between-extensions",
  files: [yamlFile, extension1File, extension2File]
};
