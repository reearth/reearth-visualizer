import React, { IframeHTMLAttributes, ReactNode } from "react";

import useHook, { IFrameAPI } from "./hooks";
import IFrame from "./IFrame";

export { defaultIsMarshalable } from "./hooks";
export type { IFrameAPI } from "./hooks";

export type Props = {
  className?: string;
  canBeVisible?: boolean;
  skip?: boolean;
  src?: string;
  sourceCode?: string;
  renderPlaceholder?: ReactNode;
  filled?: boolean;
  iFrameProps?: IframeHTMLAttributes<HTMLIFrameElement>;
  isMarshalable?: boolean | "json" | ((target: any) => boolean | "json");
  exposed?: ((api: IFrameAPI) => { [key: string]: any }) | { [key: string]: any };
  onMessage?: (message: any) => void;
  onPreInit?: () => void;
  onError?: (err: any) => void;
  onDispose?: () => void;
  onClick?: () => void;
};

const Plugin: React.FC<Props> = ({
  className,
  canBeVisible,
  skip,
  src,
  sourceCode,
  renderPlaceholder,
  filled,
  iFrameProps,
  isMarshalable,
  exposed,
  onMessage,
  onPreInit,
  onError,
  onDispose,
  onClick,
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
      autoResize={!filled}
      className={className}
      html={iFrameHtml}
      ref={iFrameRef}
      visible={iFrameVisible}
      onMessage={onMessage}
      iFrameProps={iFrameProps}
      onClick={onClick}
    />
  ) : renderPlaceholder ? (
    <>{renderPlaceholder}</>
  ) : null;
};

export default Plugin;
