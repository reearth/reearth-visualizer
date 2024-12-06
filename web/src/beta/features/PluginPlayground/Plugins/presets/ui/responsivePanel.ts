import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "ui-responsive-panel-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: responsive-panel-plugin
name: Responsive Panel
version: 1.0.0
extensions:
  - id: responsive-panel
    type: widget
    name: Responsive Panel Widget
    description: Responsive Panel Widget
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "ui-responsive-panel-widget",
  title: "responsive-panel.js",
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
    :root {
      --wrapper-bg: #2c2c2c;
      --wrapper-color: #f5f5f5;
      --list-item-bg: #3c3c3c;
      --list-item-color: #e0e0e0;
      --button-bg: #3b3dd0;
      --button-hover-bg: #3537c7;
      --delete-bg: #d32f2f;
      --delete-hover-bg: #b71c1c;
    }

    .light-theme {
      --wrapper-bg: #f5f5f5;
      --wrapper-color: #333;
      --list-item-bg: #fff;
      --list-item-color: #000;
      --button-bg: #00897b;
      --button-hover-bg: #00796b;
    }

    #wrapper {
      background: var(--wrapper-bg);
      color: var(--wrapper-color);
      transition: all 0.3s;
    }

    #themeToggle {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: var(--wrapper-color);
      transition: transform 0.3s;
    }

    #themeToggle:hover {
      transform: scale(1.2);
    }

    .button-container {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 15px 0;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: var(--button-bg);
      color: #fff;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;

    }

    button:hover {
      background: var(--button-hover-bg);
      transform: scale(1.05);
    }

    ul {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    li {
      margin: 8px 0;
      padding: 12px 16px;
      background: var(--list-item-bg);
      color: var(--list-item-color);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s;
    }

    li:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }

    .delete {
      background: var(--delete-bg);
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
    }

    .delete:hover {
      background: var(--delete-hover-bg);
    }
  </style>
  <div id="wrapper">
    <button id="themeToggle" title="Toggle Theme" onclick="toggleTheme()">☀️</button>
    <h2>Responsive Panel</h2>
    <h3 id="itemCount">Total Items: 0</h3>
    <div class="button-container">
      <button id="addBtn" onclick="addListItem()">Add Item</button>
    </div>
    <ul id="itemList"></ul>
  </div>
<script>
    let itemCount = 0;

    function addListItem() {
      itemCount++;
      const li = document.createElement('li');
      li.innerHTML = \`
        <span>Item \${itemCount}</span>
        <button class="delete" onclick="deleteListItem(this)">Delete</button>
      \`;
      document.getElementById('itemList').appendChild(li);
      updateItemCount();
    }

    function updateItemCount() {
      const count = document.querySelectorAll('#itemList li').length;
      document.getElementById('itemCount').textContent = \`Total Items: \${count}\`;
    }

    function deleteListItem(button) {
      button.parentElement.remove();
      updateItemCount();
    }

    function toggleTheme() {
      const wrapper = document.getElementById("wrapper");
      const toggleIcon = document.getElementById("themeToggle");
      wrapper.classList.toggle("light-theme");
      toggleIcon.innerHTML = wrapper.classList.contains("light-theme") ? "🌘" : "☀️";
    }
  </script>
\`); `
};

export const responsivePanel: PluginType = {
  id: "responsive-panel",
  title: "Responsive Panel",
  files: [widgetFile, yamlFile]
};
