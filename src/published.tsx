import React from "react";
import ReactDOM from "react-dom";

import App from "./publishedapp";
import loadConfig from "./config";

loadConfig().finally(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
