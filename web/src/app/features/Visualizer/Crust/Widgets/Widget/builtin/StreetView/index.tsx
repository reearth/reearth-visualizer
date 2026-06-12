import { Pegman } from "@reearth/app/lib/reearth-widget-ui/icons";
import { FC } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import useHooks from "./hooks";
import StreetViewContent from "./StreetViewContent";
import { Property } from "./types";
import { useEvent } from "./useEvents";

type Props = WidgetProps<Property>;

const StreetView: FC<Props> = ({ widget }) => {
  const {
    layer,
    showPano,
    setShowPano,
    isTracking,
    handleTracking,
    handleClearLayer
  } = useEvent();

  const { themeClass, panoDivRef, apiKey, handleClosePano } = useHooks({
    widget,
    layer,
    setShowPano
  });

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      {!showPano ? (
        <div
          className="p-2 flex items-center justify-center rounded-sm cursor-pointer"
          style={{
            background: themeClass === "dark" ? "#292929" : "#fff",
            color: themeClass === "dark" ? "#E0E0E0" : "#292929"
          }}
          onClick={() => handleTracking(true)}
        >
          <Pegman className="h-5 w-5" />
        </div>
      ) : (
        <StreetViewContent
          theme={themeClass}
          isTracking={isTracking}
          ref={panoDivRef}
          apiKey={apiKey}
          handleClosePano={() => {
            handleClosePano();
            handleClearLayer();
          }}
        />
      )}
    </div>
  );
};

export default StreetView;
