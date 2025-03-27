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
  sourceCode: `// A simple interactive panel that allows users to dynamically add and remove items.

  reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <div id="wrapper" class="primary-background p-16 rounded-sm primary-shadow">
    <h2 class="text-3xl text-center m-0 mb-8">Responsive Panel</h2>
    <h3 id="itemCount" class="text-xl text-center m-0 mb-16">Total Items: 0</h3>
    <div class="flex-center gap-8">
      <button id="addBtn" class="btn-primary button-padding mb-8" onclick="addListItem()">Add Item</button>
    </div>
    <ul>
    </ul>
  </div>
  <script>
    let itemCount = 0;
    function addListItem(){
      itemCount++;
      const ul = document.querySelector("ul");
      const li = document.createElement('li');
      li.className = "styled-list-item flex-between my-8";
      li.innerHTML = \\\`
      <span>Item \\\${itemCount}</span>
      <button class="btn-danger button-padding " onclick="deleteListItem(this)">Delete</button>
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
  files: [yamlFile, widgetFile]
};
