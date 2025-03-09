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
  html{
    width: 300px;
  }
  
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
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 16px;
  }

  .theme-toggle:hover {
    background: #45a049;
  }

  .storage-display {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px;
    border-radius: 4px;
    margin-top: 16px;
    font-family: monospace;
  }

  .storage-display h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
  }

  .storage-op {
    margin: 8px 0;
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    font-size: 13px;
  }

  #storageOps {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .divider {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 16px 0;
  }

  #currentStorage {
    background: rgba(0, 0, 0, 0.05);
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .storage-actions {
    margin-top: 16px;
  }
  </style>

  <div id="wrapper">
    <h3>Theme Selector - Client Storage Demo</h3>

    <div class="theme-content light">
      <div class="flex-center">
        <button id="themeToggle" class="theme-toggle">Switch to Dark Theme</button>
      </div>

      <div class="divider"></div>

      <div class="storage-display" id="storageDisplay">
        <h4>Current Storage State:</h4>
        <div id="currentStorage">Loading...</div>

        <h4>Storage Operations Log:</h4>
        <div id="storageOps"></div>

        <div class="flex-center storage-actions">
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
  const theme = await reearth.data.clientStorage.getAsync(THEME_KEY);
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
        await reearth.data.clientStorage.setAsync(THEME_KEY, msg.theme);
        reearth.ui.postMessage({
          type: "themeUpdate",
          theme: msg.theme
        });
        await updateStorageDisplay();
        break;

      case "viewKeys":
        const keys = await reearth.data.clientStorage.keysAsync();
        reearth.ui.postMessage({
          type: "keysUpdate",
          keys: keys
        });
        break;

      case "clearStorage":
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

export const themeSelector: PluginType = {
  id: "theme-selector",
  files: [widgetFile, yamlFile],
  title: "Theme Selector"
};
