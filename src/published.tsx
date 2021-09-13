// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";

import loadConfig from "./config";
import App from "./publishedapp";

loadConfig().finally(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
