// Workbench entry point - standalone viewer for local plugin development

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import type { Config } from "./services/config";
import App from "./workbenchapp";
import "./wdyr";
import "@reearth-widget-ui/styles/globals.css";

window.React = React;
window.ReactDOM = ReactDOM;

// The Workbench needs no backend, auth or config. Provide only the minimum the
// shared Viewer reads: `plugins` as the fallback base URL for built-in plugins.
// Dev plugins are loaded through `?dev-plugin=` and do not use it.
window.REEARTH_CONFIG = { plugins: "/plugins" } as Config;

const element = document.getElementById("root");
if (!element) throw new Error("root element is not found");

const root = createRoot(element);
root.render(<App />);
