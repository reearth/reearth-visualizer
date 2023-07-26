import React from "react";

const pluginId = "Local-plugin~1.0.0";
const widgetExtensionId = "localwidget";

function LocalWidget(widget, theme) {
  console.log("theme: ", theme);
  console.log("widget: ", widget);
  return (
    <div style={{ background: "navy", padding: "20px", borderRadius: "10px" }}>
      <p>Re:Earth API version: {window.reearth.apiVersion}</p>
      <p>Re:Earth engine name: {window.reearth.engineName}</p>
    </div>
  );
}

function LocalBlock() {
  return React.createElement(
    "div",
    { className: "blockone" },
    React.createElement("h1", null, "LOCAL BLOCK"),
  );
}

const localPlugin = {
  id: pluginId,
  name: "Cool Plugin #2",
  widgets: [
    {
      type: "widget",
      extensionId: widgetExtensionId,
      name: "LocalWidget",
      component: LocalWidget,
    },
  ],
  blocks: [
    {
      type: "block",
      extensionId: "localblock",
      name: "LocalBlock",
      component: LocalBlock,
    },
  ],
};

console.log(localPlugin);

const widgetId = `${pluginId}/${widgetExtensionId}`;

//dev
export { widgetId };
export default LocalWidget;

//prod
// export default localPlugin;
