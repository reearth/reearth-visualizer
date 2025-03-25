import { FileType, PluginType } from "../../constants";
import { PRESET_PLUGIN_COMMON_STYLE } from "../common";

const yamlFile: FileType = {
  id: "ui-sidebar-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: sidebar-plugin
name: Sidebar
version: 1.0.0
extensions:
  - id: sidebar
    type: widget
    name: Sidebar Widget
    description: Sidebar Widget
    widgetLayout:
      extended: true
      defaultLocation:
        zone: outer
        section: left
        area: middle
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "ui-sidebar-widget",
  title: "sidebar.js",
  sourceCode: `// A collapsible sidebar navigation panel with menu items.

  reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
  <style>
  /* Plugin-specific styling */

  /* The <html>element is positioned absolutely with a height of 100% and a default width of 300px. This ensures the sidebar occupies the full vertical space of its container.  */

  html {
    position: absolute;
    height: 100%;
    width: 300px;
  }

  html.collapsed {
    width: 65px;
  }

  body,
  #wrapper {
    position: absolute;
    height: 100%;
    width: 100%;
  }

  #wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .upside {
    position: relative;
    min-height: 120px;
  }

  #toggleBtn {
    font-size: 24px;
  }

  #searchBar {
    position: absolute;
    top: 90px;
    left: 8px;
    width: 95%;
  }

  .collapsed #sidebarTitle {
    display: none;
  }

  .collapsed .menu-title {
    display: none;
  }

  .menu-container {
    overflow-y: auto;
  }

  .menu li .menu-title {
    flex-grow: 1;
  }

  .menu li .menu-dots {
    font-size: 18px;
    color: #999;
  }
</style>

<div id="wrapper">
  <div class="upside">
    <button id="toggleBtn" class="icon-btn">☰</button>
    <h2 id="sidebarTitle">Sidebar</h2>
    <input type="text" id="searchBar" class="input" placeholder="Search..." />
  </div>
  <div class="menu-container">
    <ul class="menu">
      <li class="flex-between">
        <span>🏠</span>
        <span class="menu-title">Home</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>ℹ️</span>
        <span class="menu-title">About</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>📞</span>
        <span class="menu-title">Contact</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>❓</span>
        <span class="menu-title">FAQ</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>💡</span>
        <span class="menu-title">Help</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>⚙️</span>
        <span class="menu-title">Settings</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>👤</span>
        <span class="menu-title">Profile</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>📊</span>
        <span class="menu-title">Dashboard</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>🔔</span>
        <span class="menu-title">Notifications</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li class="flex-between">
        <span>📄</span>
        <span class="menu-title">Reports</span>
        <span class="menu-dots">⋮</span>
      </li>
    </ul>
  </div>
</div>
<script>
  const toggleBtn = document.getElementById("toggleBtn");
  let isCollapsed = false;

  toggleBtn.addEventListener("click", () => {
    isCollapsed = !isCollapsed
    if(isCollapsed){
      document.documentElement.classList.add('collapsed')
    }else{
      document.documentElement.classList.remove('collapsed')
    }
  });
</script>
  \`); `
};

export const sidebar: PluginType = {
  id: "sidebar",
  files: [yamlFile, widgetFile]
};
