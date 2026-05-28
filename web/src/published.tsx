// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./publishedapp";
import loadConfig from "./services/config";
import { initializeSentinel } from "./services/sentinel";
import "./wdyr";
import "@reearth-widget-ui/styles/globals.css";

window.React = React;
window.ReactDOM = ReactDOM;

loadConfig().finally(async () => {
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");

  // Initialize Sentinel for protected tile server authentication
  await initializeSentinel();

  const root = createRoot(element);
  root.render(<App />);
});
