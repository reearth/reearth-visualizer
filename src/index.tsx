// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";

import App from "./app";
import loadConfig from "./config";
import { initialize as initializeSentry } from "./sentry";

loadConfig().finally(() => {
  initializeSentry();
  ReactDOM.render(<App />, document.getElementById("root"));
});
