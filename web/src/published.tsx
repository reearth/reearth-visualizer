// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./publishedapp";
import loadConfig from "./services/config";
import "./wdyr";

window.React = React;
window.ReactDOM = ReactDOM;

loadConfig().finally(() => {
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");
  const root = createRoot(element);
  root.render(<App />);
});
