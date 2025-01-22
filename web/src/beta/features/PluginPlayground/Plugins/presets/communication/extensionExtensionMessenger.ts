import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

// YAML File Definition
const yamlFile: FileType = {
  id: "extension-extension-messenger-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: extension-extension-messenger-plugin
name: Extension Extension Messenger
version: 1.0.0
extensions:
  - id: messenger1
    type: widget
    name: Messenger 1
    description: Messenger 1 Widget
  - id: messenger2
    type: widget
    name: Messenger 2
    description: Messenger 2 Widget
`,
  disableEdit: true,
  disableDelete: true
};

// Messenger 1 Widget Source Code
const messenger1SourceCode = `
reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex-grow: 1;
    }

    button {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #45a049;
    }

    .received {
      background: white;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .messages-container {
      min-height: 50px;
      margin-top: 10px;
    }

    .message {
      padding: 8px;
      margin: 4px 0;
      background: #f8f9fa;
      border-radius: 4px;
    }
  </style>

   <div id="wrapper">
    <h2>Messenger 1</h2>
    <div class="flex-center">
      <input id="messageInput" type="text" placeholder="Enter message"/>
      <button id="sendButton">Send</button>
    </div>
    <h3>Received Messages</h3>
    <div class="received">
      <div id="messagesContainer" class="messages-container"></div>
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
reearth.extension.on("message", msg => {
  if (msg.type === "send") {
    const extensions = reearth.extension.list;
    const target = extensions.find(ext => ext.extensionId === "messenger2");
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

// Messenger 2 Widget Source Code
const messenger2SourceCode = `
reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex-grow: 1;
    }

    button {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #45a049;
    }

    .received {
      background: white;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .messages-container {
      min-height: 50px;
      margin-top: 10px;
    }

    .message {
      padding: 8px;
      margin: 4px 0;
      background: #f8f9fa;
      border-radius: 4px;
    }
  </style>

    <div id="wrapper">
    <h2>Messenger 2</h2>
    <div class="flex-center">
      <input id="messageInput" type="text" placeholder="Enter message"/>
      <button id="sendButton">Send</button>
    </div>
    <h3>Received Messages</h3>
    <div class="received">
      <div id="messagesContainer" class="messages-container"></div>
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

// Handle messages from UI to send to other extension
reearth.extension.on("message", msg => {
  if (msg.type === "send") {
    const extensions = reearth.extension.list;
    const target = extensions.find(ext => ext.extensionId === "messenger1");
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
const messenger1File: FileType = {
  id: "extension-extension-messenger-messenger1",
  title: "messenger1.js",
  sourceCode: messenger1SourceCode
};

const messenger2File: FileType = {
  id: "extension-extension-messenger-messenger2",
  title: "messenger2.js",
  sourceCode: messenger2SourceCode
};

// Plugin Definition
export const extensionExtensionMessenger: PluginType = {
  id: "extension-extension-messenger",
  title: "Extension Extension Messenger",
  files: [yamlFile, messenger1File, messenger2File]
};
