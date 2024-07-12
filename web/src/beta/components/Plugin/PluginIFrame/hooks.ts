import { ForwardedRef, useCallback, useImperativeHandle } from "react";

import useIFrame, { IFrameAPI } from "./useIFrame";

export type { IFrameAPI } from "./useIFrame";

export type Ref = {
  api: IFrameAPI;
  reset: () => void;
};

export default function useHooks({
  ref,
  ready,
  visible,
  type,
  enabled,
  onRender,
}: {
  ref?: ForwardedRef<Ref>;
  ready?: boolean;
  visible?: boolean;
  type?: string;
  enabled?: boolean;
  onRender?: (type: string) => void;
}) {
  const handleRender = useCallback(() => type && onRender?.(type), [type, onRender]);

  const {
    ref: IFrameRef,
    api,
    html,
    options,
    handleLoad,
    reset,
  } = useIFrame({
    ready,
    enabled,
    visible,
    onRender: handleRender,
  });

  useImperativeHandle(
    ref,
    (): Ref => ({
      api,
      reset,
    }),
  );

  return {
    ref: IFrameRef,
    html,
    options,
    handleLoad,
  };
}
