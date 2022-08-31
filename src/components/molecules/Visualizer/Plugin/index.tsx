import P, { Props as PluginProps } from "@reearth/components/atoms/Plugin";

import useHooks from "./hooks";
import type { Layer, Widget, Block } from "./types";

export type {
  Layer,
  Block,
  Widget,
  WidgetLayout,
  InfoboxProperty,
  WidgetLocation,
  WidgetAlignment,
} from "./types";
export { Provider, useContext } from "./context";
export type { Props as ProviderProps, Context } from "./context";

export type Props = {
  className?: string;
  sourceCode?: string;
  pluginId?: string;
  extensionId?: string;
  extensionType?: string;
  autoResize?: "both" | "width-only" | "height-only";
  visible?: boolean;
  property?: any;
  pluginProperty?: any;
  pluginBaseUrl?: string;
  layer?: Layer;
  widget?: Widget;
  block?: Block;
  iFrameProps?: PluginProps["iFrameProps"];
  onClick?: () => void;
  onRender?: (
    options:
      | {
          width?: string | number;
          height?: string | number;
          extended?: boolean;
        }
      | undefined,
  ) => void;
  onResize?: (
    width: string | number | undefined,
    height: string | number | undefined,
    extended: boolean | undefined,
  ) => void;
};

export default function Plugin({
  className,
  sourceCode,
  pluginId,
  extensionId,
  extensionType,
  autoResize,
  visible,
  pluginBaseUrl = "/plugins",
  layer,
  widget,
  block,
  pluginProperty,
  iFrameProps,
  onClick,
  onRender,
  onResize,
}: Props): JSX.Element | null {
  const { skip, src, isMarshalable, onPreInit, onDispose, exposed, onError } = useHooks({
    pluginId,
    extensionId,
    extensionType,
    pluginBaseUrl,
    layer,
    widget,
    block,
    pluginProperty,
    onRender,
    onResize,
  });

  return !skip && (src || sourceCode) ? (
    <P
      className={className}
      src={src}
      sourceCode={sourceCode}
      autoResize={autoResize}
      iFrameProps={iFrameProps}
      canBeVisible={visible}
      isMarshalable={isMarshalable}
      exposed={exposed}
      onError={onError}
      onPreInit={onPreInit}
      onDispose={onDispose}
      onClick={onClick}
    />
  ) : null;
}
