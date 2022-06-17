// import "./wdyr"; // should be the first import

import { createRoot } from "react-dom/client";

import loadConfig from "./config";
import App from "./publishedapp";

loadConfig().finally(() => {
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");
  const root = createRoot(element);
  root.render(<App />);
});
