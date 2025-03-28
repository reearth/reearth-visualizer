import { FileType, PluginType } from "../../constants";

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
  <style>
  /* Generic styling system that provides consistent UI components and styling across all plugins */

  @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");
  </style>
  <div id="wrapper" class="primary-background p-16 rounded-sm primary-shadow flex-column gap-16">
    <h2 class="text-3xl text-center m-0">Responsive Panel</h2>
    <h3 id="itemCount" class="text-xl text-center m-0">Total Items: 0</h3>
    <div class="flex-center">
      <button id="addBtn" class="btn-primary button-padding" onclick="addListItem()">Add Item</button>
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
