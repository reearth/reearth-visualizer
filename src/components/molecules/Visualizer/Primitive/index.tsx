import { mergeWith } from "lodash";
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
  overriddenProperties?: { [id in string]: any };
};

export type Component<P = any, PP = any, SP = any> = ComponentType<Props<P, PP, SP>>;

export default function PrimitiveComponent<P = any, PP = any, SP = any>({
  isHidden,
  pluginBaseUrl: _pluginBaseUrl,
  overriddenProperties,
  ...props
}: Props<P, PP, SP>) {
  const ctx = useContext();
  const overridenProperty = useMemo(
    () =>
      props.layer && overriddenProperties?.[props.layer.id]
        ? mergeProperty(props.layer.property, overriddenProperties[props.layer.id])
        : undefined,
    [overriddenProperties, props.layer],
  );
  const actualLayer = useMemo(
    () =>
      props.layer && overridenProperty
        ? { ...props.layer, property: overridenProperty }
        : props.layer,
    [overridenProperty, props.layer],
  );

  const Builtin = useMemo(() => {
    const builtin = ctx?.engine?.builtinPrimitives;
    return props.layer?.pluginId && props.layer.extensionId
      ? builtin?.[`${props.layer.pluginId}/${props.layer.extensionId}`]
      : undefined;
  }, [ctx, props.layer?.extensionId, props.layer?.pluginId]);

  return isHidden || !props.layer?.isVisible ? null : Builtin ? (
    <Builtin {...props} layer={actualLayer} />
  ) : null;
}

export function mergeProperty(a: any, b: any) {
  return mergeWith(
    { ...a },
    b,
    (s: any, v: any, _k: string | number | symbol, _obj: any, _src: any, stack: { size: number }) =>
      stack.size > 0 || Array.isArray(v) ? v ?? s : undefined,
  );
}
