import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "popup-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: popup-plugin
name: Popup
version: 1.0.0
extensions:
  - id: popup
    type: widget
    name: Popup
    description: Popup Example Plugin
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "popup",
  title: "popup.js",
  sourceCode: `reearth.ui.show(\`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");

  /* Plugin-specific styling */
    html {
      width: 280px;
    }
  </style>

  <div class="primary-background p-16 rounded-sm primary-shadow">
      <h3 class="text-center text-xl border-bottom pb-8 m-0">Popup API Demo</h3>
      <h4 class="text-primary mb-8">Controls</h4>
      <div class="mb-8">
        <button id="showPopup" class="btn-primary p-8">Show Popup</button>
        <button id="closePopup" class="btn-neutral p-8">Close Popup</button>
      </div>
      <div class="mb-8">
        <button id="sendMessageToPopup" class="btn-primary p-8">Send Message To Popup</button>
      </div>
      <h4 class="text-primary mb-8">Received Message</h4>
      <div id="messageFromPopup" class="message-display text-sm empty">No messages yet</div>
  </div>

  <script>
    // Track popup state
    let popupIsVisible = false;

    function updateButtonStates() {
      // Enable/disable buttons based on popup state
      document.getElementById("showPopup").disabled = popupIsVisible;
      document.getElementById("closePopup").disabled = !popupIsVisible;
      document.getElementById("sendMessageToPopup").disabled = !popupIsVisible;
    }

    // Initial button states
    updateButtonStates();

    // Show Popup
    document.getElementById("showPopup").addEventListener("click", () => {
      parent.postMessage({ type: "showPopup" }, "*");
      popupIsVisible = true;
      updateButtonStates();
    });

    // Close Popup
    document.getElementById("closePopup").addEventListener("click", () => {
      if (popupIsVisible) {
        parent.postMessage({ type: "closePopup" }, "*");
        popupIsVisible = false;
        updateButtonStates();
      }
    });

    // Send Message to Popup
    document.getElementById("sendMessageToPopup").addEventListener("click", () => {
      if (popupIsVisible) {
        const msgId = Math.floor(Math.random() * 1000);
        parent.postMessage({
          type: "postMessageToPopup",
          message: 'UI Message #' + msgId
        }, "*");
      }
    });

    // Receive messages from the extension
    addEventListener("message", (event) => {
      if (event.source !== parent) return;
      if (event.data.type === "popupClosed") {
        // Update UI when popup is closed
        popupIsVisible = false;
        updateButtonStates();
      }
      else if (event.data.message) {
        document.getElementById("messageFromPopup").innerHTML = event.data.message;
        document.getElementById("messageFromPopup").classList.remove("empty");
      }
    });
  </script>

\`);

// Popup window
  const popupHTML = \`
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");

  /* Plugin-specific styling */
    html, body {
      margin: 0;
      width: 250px;
      font-family: 'Arial', sans-serif;
    }

    #wrapper {
      height: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      padding: 12px;
      background: #fff;
    }

    h3 {
      margin: 0 0 8px;
      color: #222;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }

    h4 {
      margin: 12px 0 6px;
      color: #555;
      font-weight: 500;
      border-top: 1px solid #eee;
      padding-top: 8px;
      font-size: 14px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 18px;
      width: 24px;
    }

    .position-column {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .offset-row {
      display: flex;
      gap: 4px;
    }

    button {
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 11px;
      cursor: pointer;
    }

    .send-btn {
      background-color: #0078D7;
      color: white;
      border: none;
      padding: 6px 10px;
      font-size: 13px;
      margin-top: 4px;
    }

    #messageDisplay {
      background-color: #f8f8f8;
      border-left: 3px solid #0078D7;
      padding: 8px;
      margin-top: 8px;
      font-size: 13px;
      min-height: 18px;
    }

    .empty {
      color: #999;
      font-style: italic;
    }

    .settings {
      font-size: 12px;
      color: #666;
    }
  </style>

  <div id="wrapper">
    <h3>
      Popup
      <button id="closeButton" class="close-btn">✕</button>
    </h3>

    <div class="settings">
      Position: <span id="positionDisplay">bottom</span> |
      Offset: <span id="offsetDisplay">0</span>
    </div>

    <h4>Position</h4>
    <div class="position-column">
      <div>
        <button onclick="updatePosition('right-start')">right-start</button>
        <button onclick="updatePosition('right')">right</button>
        <button onclick="updatePosition('right-end')">right-end</button>
      </div>

      <div>
        <button onclick="updatePosition('bottom-start')">bottom-start</button>
        <button onclick="updatePosition('bottom')">bottom</button>
        <button onclick="updatePosition('bottom-end')">bottom-end</button>
      </div>
    </div>

    <h4>Offset</h4>
    <div class="offset-row">
      <button onclick="updateOffset(0)">0px</button>
      <button onclick="updateOffset(10)">10px</button>
      <button onclick="updateOffset(20)">20px</button>
    </div>

    <h4>Message</h4>
    <button id="sendToUI" class="send-btn">Send Message to UI</button>
    <div id="messageDisplay" class="empty">No messages yet</div>
  </div>

  <script>
    // Position and offset handling
    let currentPosition = 'bottom-start';
    let currentOffset = 0;

    function updatePosition(position) {
      currentPosition = position;
      document.getElementById('positionDisplay').textContent = position;

      parent.postMessage({
        type: "updatePopup",
        position: currentPosition,
        offset: currentOffset
      }, "*");
    }

    function updateOffset(offset) {
      currentOffset = offset;
      document.getElementById('offsetDisplay').textContent = offset;

      parent.postMessage({
        type: "updatePopup",
        position: currentPosition,
        offset: currentOffset
      }, "*");
    }

    // Close button handler
    document.getElementById("closeButton").addEventListener("click", () => {
      parent.postMessage({ type: "closePopup" }, "*");
    });

    // Send message to UI
    document.getElementById("sendToUI").addEventListener("click", () => {
      const msgId = Math.floor(Math.random() * 1000);
      parent.postMessage({
        type: "messageToUI",
        message: 'Popup Message #' + msgId
      }, "*");
    });

    // Receive messages
    addEventListener("message", (event) => {
      if (event.source !== parent) return;
      if (event.data.message) {
        document.getElementById("messageDisplay").innerHTML = event.data.message;
        document.getElementById("messageDisplay").classList.remove("empty");
      }
    });
  </script>
\`;

// Handle messages from the UI
// Documentation for Extension "on" event https://visualizer.developer.reearth.io/plugin-api/extension/#message-1
reearth.extension.on("message", (msg) => {
  if (msg.type === "showPopup") {
  // Documentation for Popup "show" method https://visualizer.developer.reearth.io/plugin-api/popup/#show
    reearth.popup.show(popupHTML, { position: "bottom-start" });
  }
  else if (msg.type === "closePopup") {
  // Documentation for Popup "close" method https://visualizer.developer.reearth.io/plugin-api/popup/#close
    reearth.popup.close();
    // Notify UI that popup is closed
    // Documentation for Extension "postMessage" method https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
    reearth.ui.postMessage({ type: "popupClosed" });
  }
  else if (msg.type === "updatePopup") {
  // Documentation for Popup "update" method https://visualizer.developer.reearth.io/plugin-api/popup/#update
    reearth.popup.update({
      position: msg.position,
      offset: msg.offset
    });
  }
  else if (msg.type === "postMessageToPopup") {
  // Documentation for Popup "postMessage" method https://visualizer.developer.reearth.io/plugin-api/popup/#postmessage
    reearth.popup.postMessage({ message: msg.message });
  }
  else if (msg.type === "messageToUI") {
    reearth.ui.postMessage({ message: msg.message });
  }
});

// Listen for popup closing (user might close it directly)
reearth.popup.on("close", () => {
  reearth.ui.postMessage({ type: "popupClosed" });
});
  `
};

export const popupPlugin: PluginType = {
  id: "popup-plugin",
  files: [yamlFile, widgetFile]
};
