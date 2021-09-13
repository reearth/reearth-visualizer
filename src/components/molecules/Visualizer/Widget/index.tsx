import React, { ComponentType } from "react";

import { Widget } from "../Plugin";

// import Plugins, { Widget } from "../Plugin";
import builtin from "./builtin";

export type { Widget } from "../Plugin";

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  widget?: Widget;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
};

export type Component<PP = any, SP = any> = ComponentType<Props<PP, SP>>;

export default function WidgetComponent<PP = any, SP = any>({
  pluginBaseUrl: _pluginBaseUrl,
  ...props
}: Props<PP, SP>) {
  const Builtin =
    props.widget?.pluginId && props.widget.extensionId
      ? builtin[`${props.widget.pluginId}/${props.widget.extensionId}`]
      : undefined;

  return Builtin ? <Builtin {...props} /> : null; // TODO: widget plugin is not supported yet
  // <Plugin
  //   pluginId={props.widget?.pluginId}
  //   extensionId={props.widget?.extensionId}
  //   sourceCode={(props.widget as any)?.__REEARTH_SOURCECODE} // for debugging
  //   extensionType="widget"
  //   visible
  //   style={{ position: "absolute", top: 0, left: 0 }} // TODO: widget align system
  //   pluginBaseUrl={pluginBaseUrl}
  //   property={props.pluginProperty}
  //   sceneProperty={props.sceneProperty}
  //   widget={props.widget}
  // />
}
