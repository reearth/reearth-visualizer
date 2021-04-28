import React from "react";

import useImport from "@reearth/util/use-import";
import { SceneProperty } from "@reearth/util/value";
import { primitives } from "../builtin";

export type PrimitiveProps<P = any, PP = any> = {
  id?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isEditing?: boolean;
  isVisible?: boolean;
  isSelected?: boolean;
  property?: P;
  pluginProperty?: PP;
  sceneProperty?: SceneProperty;
  selected?: [string | undefined, string | undefined];
  pluginUrl?: string;
  onClick?: () => void;
};

export type PluginPrimitiveProps<P = any, PP = any> = PrimitiveProps<P, PP> & {
  pluginId: string;
  extensionId: string;
};

export type PrimitiveComponent<P = any, PP = any> = React.FC<PrimitiveProps<P, PP>>;

const getUrl = (pluginId: string) => {
  const [id, version] = pluginId.split("#");
  if (!id || !version) return undefined;
  return `${window.REEARTH_CONFIG?.plugin || ""}/${encodeURIComponent(
    id || "",
  )}/${encodeURIComponent(version || "")}/`;
};

const PluginPrimitive: React.FC<PluginPrimitiveProps> = props => {
  const url = getUrl(props.pluginId);

  let embedded: PrimitiveComponent | undefined;
  if (props.pluginId === "reearth") {
    embedded = primitives[props.extensionId];
  }

  const { data: module } = useImport(`${url}/index.js`, !url || !!embedded);

  const Primitive =
    embedded ??
    (module?.primitives?.[props.extensionId] as PrimitiveComponent<any, any> | undefined);
  return Primitive ? <Primitive {...props} pluginUrl={url} /> : null;
};

export default PluginPrimitive;
