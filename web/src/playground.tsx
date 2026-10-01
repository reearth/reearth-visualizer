// Entry of the standalone Plugin Playground viewer (playground.html). Unlike
// main.tsx it has no auth, GraphQL or routing; it loads a plugin from a local
// dev server given as `?dev-plugin=<url>`.

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./playgroundapp";
import loadConfig from "./services/config";
import "@reearth-widget-ui/styles/globals.css";

window.React = React;
window.ReactDOM = ReactDOM;

// reearth_config.json is optional here; the defaults are enough.
loadConfig()
  .catch(() => {})
  .finally(() => {
    const element = document.getElementById("root");
    if (!element) throw new Error("root element is not found");
    createRoot(element).render(<App />);
  });
