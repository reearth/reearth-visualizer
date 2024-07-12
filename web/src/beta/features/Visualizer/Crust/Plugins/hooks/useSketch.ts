import { useCallback } from "react";

import { SketchOptions, SketchType } from "@reearth/core";

import { Props } from "../types";

export default ({ mapRef }: Pick<Props, "mapRef">) => {
  const getSketchTool = useCallback(() => mapRef?.current?.sketch?.getType(), [mapRef]);

  const setSketchTool = useCallback(
    (type: SketchType | undefined) => mapRef?.current?.sketch?.setType(type, "plugin"),
    [mapRef],
  );

  const getSketchOptions = useCallback(() => mapRef?.current?.sketch?.getOptions(), [mapRef]);

  const overrideSketchOptions = useCallback(
    (options: SketchOptions) => mapRef?.current?.sketch?.overrideOptions(options),
    [mapRef],
  );

  return {
    getSketchTool,
    setSketchTool,
    getSketchOptions,
    overrideSketchOptions,
  };
};
