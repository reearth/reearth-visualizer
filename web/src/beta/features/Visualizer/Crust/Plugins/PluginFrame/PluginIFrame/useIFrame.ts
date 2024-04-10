import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Ref as IFrameRef } from "../IFrame";

import { usePostMessage } from "./usePostMessage";

export type IFrameAPI = {
  render: (
    html: string,
    options?: {
      visible?: boolean;
      width?: number | string;
      height?: number | string;
      onAutoResized?: () => void;
    },
  ) => void;
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  postMessage: (message: any) => void;
};

export default function useIFrame({
  ready,
  enabled,
  visible: iframeCanBeVisible,
  onRender,
}: {
  ready?: boolean;
  enabled?: boolean;
  visible?: boolean;
  onRender?: () => void;
}) {
  const ref = useRef<IFrameRef>(null);
  const [iFrameLoaded, setIFrameLoaded] = useState(false);
  const [[html, options], setIFrameState] = useState<
    [
      string,
      (
        | {
            visible?: boolean;
            width?: number | string;
            height?: number | string;
            onAutoResized?: () => void;
          }
        | undefined
      ),
    ]
  >(["", undefined]);
  const postMessage = usePostMessage(ref, !ready || !iFrameLoaded);
  const handleLoad = useCallback(() => setIFrameLoaded(true), []);
  const reset = useCallback(() => setIFrameState(["", undefined]), []);

  const api = useMemo<IFrameAPI>(
    () => ({
      render: (html, { visible = true, ...options } = {}) => {
        setIFrameState([html, { visible: !!iframeCanBeVisible && !!visible, ...options }]);
        onRender?.();
      },
      resize: (width, height) => {
        ref.current?.resize(width, height);
      },
      postMessage,
    }),
    [iframeCanBeVisible, onRender, postMessage],
  );

  useEffect(() => {
    setIFrameState(([html, options]) => [html, { ...options, visible: !!iframeCanBeVisible }]);
  }, [iframeCanBeVisible]);

  useEffect(() => {
    if (!ready || !enabled) setIFrameLoaded(false);
  }, [ready, enabled]);

  return {
    ref,
    api,
    html,
    options,
    handleLoad,
    reset,
  };
}
