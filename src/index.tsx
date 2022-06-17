// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./app";
import loadConfig from "./config";
import { initialize as initializeSentry } from "./sentry";

window.React = React;
window.ReactDOM = ReactDOM;

loadConfig().finally(() => {
  initializeSentry();
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");
  const root = createRoot(element);
  root.render(<App />);
});
