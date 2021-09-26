import React, { CSSProperties, IframeHTMLAttributes, ReactNode } from "react";

import useHook, { IFrameAPI as IFrameAPIType } from "./hooks";
import IFrame from "./IFrame";

export type IFrameAPI = IFrameAPIType;

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  skip?: boolean;
  style?: CSSProperties;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  exposed?: ((api: IFrameAPI) => { [key: string]: any }) | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
};

const Plugin: React.FC<Props> = ({
  className,
  canBeVisible,
  skip,
  style,
  src,
  sourceCode,
  renderPlaceholder,
  iFrameProps,
  isMarshalable,
  exposed,
  onMessage,
  onPreInit,
  onError,
  onDispose,
}) => {
  const { iFrameRef, iFrameHtml, iFrameVisible } = useHook({
    iframeCanBeVisible: canBeVisible,
    skip,
    src,
    sourceCode,
    isMarshalable,
    exposed,
    onPreInit,
    onError,
    onDispose,
  });

  return iFrameHtml ? (
    <IFrame
      autoResize
      className={className}
      style={style}
      html={iFrameHtml}
      ref={iFrameRef}
      visible={iFrameVisible}
      onMessage={onMessage}
      iFrameProps={iFrameProps}
    />
  ) : renderPlaceholder ? (
    <>{renderPlaceholder}</>
  ) : null;
};

export default Plugin;
