import { FileType, PluginType } from "../../constants";

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
  <style>
    /* Generic styling system that provides consistent UI components and styling across all plugins */

    @import url("https://reearth.github.io/visualizer-plugin-sample-data/public/css/preset-ui.css");

  /* Plugin-specific styling */

    .content-wrapper {
      overflow: hidden;
      height: calc(100vh - 20px);
      display: flex;
      flex-direction: column;
    }

    .upside {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 10;
      padding: 10px 0;
    }

    #toggleBtn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 24px;
      color: #555;
    }

    .menu-container {
      flex-grow: 1;
      overflow-y: auto;
      margin-top: 10px;
    }

    .menu li .menu-icon {
      margin-right: 10px;
    }

    .menu li .menu-title {
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
    <div class="content-wrapper">
      <div class="upside">
        <button id="toggleBtn">☰</button>
        <h2 id="sidebarTitle">Sidebar</h2>
        <input type="text" id="searchBar" class="input" placeholder="Search..." />
      </div>
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
  files: [widgetFile, yamlFile]
};
