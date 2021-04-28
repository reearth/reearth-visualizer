import React from "react";

import useImport from "@reearth/util/use-import";
import { ValueTypes, ValueType, SceneProperty } from "@reearth/util/value";
import { InfoboxProperty as InfoboxPropertyType } from "@reearth/components/molecules/EarthEditor/InfoBox/InfoBox";
import { blocks } from "../builtin";

export type InfoboxProperty = InfoboxPropertyType;

export interface BlockProps<P = any, PP = any> {
  isEditable?: boolean;
  isBuilt?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  property?: P;
  pluginProperty?: PP;
  sceneProperty?: SceneProperty;
  infoboxProperty?: InfoboxProperty;
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
}

export type Props = Omit<BlockProps, "onChange"> & {
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  url?: string;
  onChange?: <T extends ValueType>(
    propertyId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};

export type BlockComponent<P = { [key in string]: any }, PP = { [key in string]: any }> = React.FC<
  BlockProps<P, PP>
>;

const getUrl = (pluginId: string) => {
  const [id, version] = pluginId.split("#");
  if (!id || !version) return undefined;
  return `${window.REEARTH_CONFIG?.plugin || ""}/${encodeURIComponent(
    id || "",
  )}/${encodeURIComponent(version || "")}/`;
};

const PluginBlock: React.FC<Props> = props => {
  const url = getUrl(props.pluginId);

  let embedded: BlockComponent | undefined;
  if (props.pluginId === "reearth") {
    embedded = blocks[props.extensionId];
  }

  const { data: module } = useImport(`${url}/index.js`, !url || !!embedded);

  const Block =
    embedded ?? (module?.blocks?.[props.extensionId] as React.FC<BlockProps> | undefined);

  return Block ? (
    <Block
      {...props}
      onChange={(sg, f, v, t) =>
        props.propertyId && props.onChange?.(props.propertyId, sg, f, v, t)
      }
    />
  ) : null;
};

export default PluginBlock;
