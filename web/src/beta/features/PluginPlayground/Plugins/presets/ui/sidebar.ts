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
  sourceCode: `reearth.ui.show(\`
  ${PRESET_PLUGIN_COMMON_STYLE}
    <style>

#toggleBtn {
    position: relative;
    top: 16px;
    left: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: #555;
  }

  #searchBar {
    margin: 10px 0;
    padding: 8px 12px;
    width: calc(100% - 24px);
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
  }

  .menu-container {
    flex-grow: 1;
    padding: 0;
    margin: 20px 0;
    overflow-y: auto;
  }

  .menu {
    list-style: none;
    padding: 0;
    margin: 20px 0;
  }

  .menu li {
    margin: 8px 0;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .menu li:active {
    background: #d6d6d6;
  }


  .menu li .menu-icon {
    font-size: 14px;
    color: #555;
    margin-right: 10px;
  }

  .menu li .menu-title {
    font-size: 14px;
    color: #333;
    flex-grow: 1;
  }

  .menu li .menu-dots {
    font-size: 18px;
    color: #999;
  }

  .hidden {
    visibility: hidden;
    opacity: 0;
  }
</style>

<div id="wrapper">
  <button id="toggleBtn">☰</button>
  <h2 id="sidebarTitle">Sidebar</h2>
  <input type="text" id="searchBar" placeholder="Search..." />
  <div class="menu-container">
    <ul class="menu">
      <li>
        <span class="menu-icon">🏠</span>
        <span class="menu-title">Home</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">ℹ️</span>
        <span class="menu-title">About</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">📞</span>
        <span class="menu-title">Contact</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">❓</span>
        <span class="menu-title">FAQ</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">💡</span>
        <span class="menu-title">Help</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">⚙️</span>
        <span class="menu-title">Settings</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">👤</span>
        <span class="menu-title">Profile</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">📊</span>
        <span class="menu-title">Dashboard</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">🔔</span>
        <span class="menu-title">Notifications</span>
        <span class="menu-dots">⋮</span>
      </li>
      <li>
        <span class="menu-icon">📄</span>
        <span class="menu-title">Reports</span>
        <span class="menu-dots">⋮</span>
      </li>

    </ul>
  </div>
</div>
  <script>
 const toggleBtn = document.getElementById("toggleBtn");
  const sidebarTitle = document.getElementById("sidebarTitle");

  toggleBtn.addEventListener("click", () => {
    const sidebar = document.querySelector("#wrapper");
    const isCollapsed = sidebar.style.width === "60px";

    // Collapse or expand the sidebar
    sidebar.style.width = isCollapsed ? "250px" : "60px";

    // Toggle visibility instead of display for title
    sidebarTitle.classList.toggle("hidden", !isCollapsed);

    // Hide or show menu titles
    const titles = document.querySelectorAll(".menu-title");
    titles.forEach((title) => {
      title.style.display = isCollapsed ? "inline" : "none";
    });
  });
  </script>
  \`); `
};

export const sidebar: PluginType = {
  id: "sidebar",
  title: "Sidebar",
  files: [widgetFile, yamlFile]
};
