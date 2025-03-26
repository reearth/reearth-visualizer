import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "theme-selector-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: theme-selector-plugin
name: Theme Selector
version: 1.0.0
extensions:
  - id: theme-selector
    type: widget
    name: Theme Selector
    description: Theme Selector
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "theme-selector",
  title: "theme-selector.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
  .theme-content {
    transition: all 0.3s ease;
    border-radius: 4px;
    overflow: hidden;
  }

  .theme-content.light {
    color: #333333;
  }

  .theme-content.dark {
    color: #ffffff;
    background: #333333;
  }

  .theme-toggle {
    background: #4caf50;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .theme-toggle:hover {
    background: #45a049;
  }

  .storage-display {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .storage-op {
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    font-size: 13px;
  }

  #storageOps {
    max-height: 200px;
    overflow-y: auto;
  }

  #currentStorage {
    background: rgba(0, 0, 0, 0.05);
  }
  </style>

  <div class="primary-background p-16 rounded-sm">
    <p class="text-lg font-bold text-center m-0">Theme Selector - Client Storage Demo</p>

    <div class="theme-content light">
      <div class="flex-center p-16">
        <button id="themeToggle" class="theme-toggle">Switch to Dark Theme</button>
      </div>

      <div class="divider"></div>

      <div class="storage-display" id="storageDisplay">
        <p class="text-md font-bold font-monospace">Current Storage State:</p>
        <div id="currentStorage" class="text-sm p-8 rounded-sm">Loading...</div>

        <p class="text-md font-bold font-monospace">Storage Operations Log:</p>
        <div id="storageOps"></div>

        <div>
          <button id="viewKeys" class="theme-toggle">View All Keys</button>
          <button id="clearStorage" class="theme-toggle">Clear Storage</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const THEME_KEY = "user_theme_preference";
    const themeContent = document.querySelector('.theme-content');
    const toggleBtn = document.getElementById("themeToggle");
    const storageDisplay = document.getElementById("storageDisplay");
    const currentStorage = document.getElementById("currentStorage");
    const storageOps = document.getElementById("storageOps");

    function logOperation(operation) {
      const opDiv = document.createElement('div');
      opDiv.className = 'storage-op ' + themeContent.className;
      opDiv.textContent = \\\`[\\\${new Date().toLocaleTimeString()}] \\\${operation}\\\`;
      storageOps.insertBefore(opDiv, storageOps.firstChild);
    }

    function updateThemeUI(isDark) {
      themeContent.className = 'theme-content ' + (isDark ? "dark" : "light");
      storageDisplay.className = "storage-display " + (isDark ? "dark" : "light");
      const ops = document.querySelectorAll('.storage-op');
      ops.forEach(op => op.className = 'storage-op ' + (isDark ? "dark" : "light"));
      toggleBtn.textContent = isDark ? "Switch to Light Theme" : "Switch to Dark Theme";
    }

    // Initialize theme from storage
    parent.postMessage({ type: "getTheme" }, "*");

    // Theme toggle
    toggleBtn.addEventListener("click", () => {
      const isDark = themeContent.className.includes("dark");
      parent.postMessage({
        type: "setTheme",
        theme: isDark ? "light" : "dark"
      }, "*");
    });

    // View all keys
    document.getElementById("viewKeys").addEventListener("click", () => {
      parent.postMessage({ type: "viewKeys" }, "*");
    });

    // Clear storage
    document.getElementById("clearStorage").addEventListener("click", () => {
      parent.postMessage({ type: "clearStorage" }, "*");
    });

    // Listen for messages
    window.addEventListener("message", e => {
      const msg = e.data;
      if (msg.type === "themeUpdate") {
        updateThemeUI(msg.theme === "dark");

      }
      else if (msg.type === "storageUpdate") {
    const themeValue = msg.data[THEME_KEY];
    currentStorage.textContent = \\\`User Theme Preference: \\\${themeValue || "Not Set"}\\\`;

    // Log the operation
const storedTheme = msg.data[THEME_KEY];

logOperation(\\\`Storage updated: Theme preference is \\\${storedTheme ? \\\`set to \\\${storedTheme}\\\` : 'not set'}\\\`);

}
      else if (msg.type === "keysUpdate") {
    logOperation(\\\`Available storage keys: \\\${msg.keys.length ? msg.keys.join(', ') : 'none'}\\\`);
}
      else if (msg.type === "storageCleared") {
      currentStorage.textContent = "User Theme Preference: Not Set";
    storageOps.innerHTML = "";
    logOperation("Storage cleared");
      }
    });
  </script>
\`);

const THEME_KEY = "user_theme_preference";

async function updateStorageDisplay() {
// Documentation on Client Storage "getAsync" method: https://visualizer.developer.reearth.io/plugin-api/data/#getasync
  const theme = await reearth.data.clientStorage.getAsync(THEME_KEY);
  // Documentation on UI "postMessage" method: https://visualizer.developer.reearth.io/plugin-api/ui/#postmessage
  reearth.ui.postMessage({
    type: "storageUpdate",
    data: { [THEME_KEY]: theme }
  });
}

reearth.extension.on("message", async msg => {
  try {
    switch (msg.type) {
      case "getTheme":
        const savedTheme = await reearth.data.clientStorage.getAsync(THEME_KEY);
        reearth.ui.postMessage({
          type: "themeUpdate",
          theme: savedTheme || "light"
        });
        await updateStorageDisplay();
        break;

      case "setTheme":
        // Documentation on Client Storage "setAsync" method: https://visualizer.developer.reearth.io/plugin-api/data/#setasync
        await reearth.data.clientStorage.setAsync(THEME_KEY, msg.theme);
        reearth.ui.postMessage({
          type: "themeUpdate",
          theme: msg.theme
        });
        await updateStorageDisplay();
        break;

      case "viewKeys":
        // Documentation on Client Storage "keysAsync" method: https://visualizer.developer.reearth.io/plugin-api/data/#keysasync
        const keys = await reearth.data.clientStorage.keysAsync();
        reearth.ui.postMessage({
          type: "keysUpdate",
          keys: keys
        });
        break;

      case "clearStorage":
        // Documentation on Client Storage "dropStoreAsync" method: https://visualizer.developer.reearth.io/plugin-api/data/#dropstoreasync
        await reearth.data.clientStorage.dropStoreAsync();
        reearth.ui.postMessage({
          type: "storageCleared"
        });
        break;
    }
  } catch (error) {
    console.error("Storage operation error:", error);
  }
});
  `
};

export const clientStorageThemeSelector: PluginType = {
  id: "client-storage-theme-selector",
  files: [yamlFile, widgetFile]
};
