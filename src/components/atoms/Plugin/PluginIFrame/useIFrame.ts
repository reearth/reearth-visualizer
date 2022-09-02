import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Ref as IFrameRef } from "../IFrame";

import { usePostMessage } from "./usePostMessage";

export type IFrameAPI = {
  render: (
    html: string,
    options?: { visible?: boolean; width?: number | string; height?: number | string },
  ) => void;
  resize: (width: string | number | undefined, height: string | number | undefined) => void;
  postMessage: (message: any) => void;
};

export default function useIFrame({
  ready,
  visible: iframeCanBeVisible,
  onRender,
}: {
  ready?: boolean;
  visible?: boolean;
  onRender?: () => void;
}) {
  const ref = useRef<IFrameRef>(null);
  const [iFrameLoaded, setIFrameLoaded] = useState(false);
  const [[html, options], setIFrameState] = useState<
    [string, { visible?: boolean; width?: number | string; height?: number | string } | undefined]
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
    if (!ready) setIFrameLoaded(false);
  }, [ready]);

  return {
    ref,
    api,
    html,
    options,
    handleLoad,
    reset,
  };
}
