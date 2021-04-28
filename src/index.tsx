import React from "react";
import ReactDOM from "react-dom";

import App from "./app";
import loadConfig from "./config";

loadConfig().finally(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
