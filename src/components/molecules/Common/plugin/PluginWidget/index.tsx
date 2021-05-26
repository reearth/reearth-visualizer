import React from "react";

import useImport from "@reearth/util/use-import";
import { SceneProperty } from "@reearth/util/value";
import { widgets } from "../builtin";

export type WidgetProps<P = any, PP = any> = {
  isBuilt?: boolean;
  isEditable?: boolean;
  pluginUrl?: string;
  property?: P;
  pluginProperty?: PP;
  sceneProperty?: SceneProperty;
  selected?: [string | undefined, string | undefined];
};

export type PluginWidgetProps<P = any, PP = any> = WidgetProps<P, PP> & {
  pluginId: string;
  extensionId: string;
};

export type WidgetComponent<P = any, PP = any> = React.FC<WidgetProps<P, PP>>;

const getUrl = (pluginId: string) => {
  if (!window.REEARTH_CONFIG?.api) return undefined;
  const [id, version] = pluginId.split("#");
  if (!id || !version) return undefined;
  return `${window.REEARTH_CONFIG.api}/plugins/${encodeURIComponent(id || "")}/${encodeURIComponent(
    version || "",
  )}/`;
};

const PluginWidget: React.FC<PluginWidgetProps> = props => {
  const url = getUrl(props.pluginId);

  let embedded: WidgetComponent | undefined;
  if (props.pluginId === "reearth") {
    embedded = widgets[props.extensionId];
  }

  const { data: module } = useImport(`${url}/index.js`, !url || !!embedded);

  const Widget = embedded ?? (module?.widgets?.[props.extensionId] as WidgetComponent<any, any>);
  return Widget ? <Widget {...props} pluginUrl={url} /> : null;
};

export default PluginWidget;
