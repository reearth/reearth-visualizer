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
    ul {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    li {
      margin: 8px 0;
      padding: 12px 16px;
      color: #36454F;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: #fff;
      cursor: pointer;
    }

    button:active {
      background: #0056b3;
    }

    .delete {
      background: #d32f2f;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 12px;
      cursor: pointer;
    }

    .delete:active {
      background: #6b0000;
    }
  </style>
  <div id="wrapper">
    <h2>Responsive Panel</h2>
    <h3 id="itemCount">Total Items: 0</h3>
    <div class="flex-center">
    <button id="addBtn" onclick="addListItem()">Add Item</button>
    </div>
    <ul></ul>
  </div>
  <script>
    let itemCount = 0;
    function addListItem(){
      itemCount++;
      const ul = document.querySelector("ul");
      const li = document.createElement('li');
      li.innerHTML = \\\`
      <span>Item \\\${itemCount}</span>
      <button class="delete" onclick="deleteListItem(this)">Delete</button>
      \\\`;
      ul.appendChild(li);
      updateItemCount()
    }

    function deleteListItem(button){
      button.parentElement.remove();
      updateItemCount()
    }

    function updateItemCount() {
      const count = document.querySelectorAll("ul li").length;
      document.getElementById("itemCount").textContent = \\\`Total Items: \\\${count}\\\`;
    }
  </script>
  \`); `
};

export const responsivePanel: PluginType = {
  id: "responsive-panel",
  files: [widgetFile, yamlFile]
};
