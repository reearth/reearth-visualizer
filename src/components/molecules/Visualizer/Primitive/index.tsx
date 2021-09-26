import React, { ComponentType, useMemo } from "react";

import { useContext } from "../Plugin";
import type { Layer } from "../Plugin";

export type { Layer } from "../Plugin";

export type Props<P = any, PP = any, SP = any> = {
  layer?: Layer<P>;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  pluginProperty?: PP;
  sceneProperty?: SP;
  pluginBaseUrl?: string;
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

export default function PrimitiveComponent<P = any, PP = any, SP = any>({
  isHidden,
  pluginBaseUrl: _pluginBaseUrl,
  ...props
}: Props<P, PP, SP>) {
  const ctx = useContext();
  const Builtin = useMemo(() => {
    const builtin = ctx?.engine?.builtinPrimitives;
    return props.layer?.pluginId && props.layer.extensionId
      ? builtin?.[`${props.layer.pluginId}/${props.layer.extensionId}`]
      : undefined;
  }, [ctx, props.layer?.extensionId, props.layer?.pluginId]);

  return isHidden || !props.layer?.isVisible ? null : Builtin ? <Builtin {...props} /> : null;
  // <Plugin
  //   pluginId={props.layer?.pluginId}
  //   extensionId={props.layer?.extensionId}
  //   sourceCode={(props.layer as any)?.__REEARTH_SOURCECODE} // for debugging
  //   extensionType="primitive"
  //   pluginBaseUrl={pluginBaseUrl}
  //   visible={false}
  //   property={props.pluginProperty}
  //   sceneProperty={props.sceneProperty}
  //   layer={props.layer}
  //   pluginProperty={pluginProperty}
  // />
}
