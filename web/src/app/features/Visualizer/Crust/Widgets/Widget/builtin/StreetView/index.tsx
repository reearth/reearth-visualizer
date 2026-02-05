import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
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

  const { themeClass, panoDivRef, handleClosePano } = useHooks({
    widget,
    layer,
    setShowPano
  });

  if (!showPano) {
    return (
      <Button
        type="button"
        size="sm"
        className="w-20 rounded-sm text-xs"
        disabled={isTracking}
        onClick={() => handleTracking(true)}
      >
        Street View
      </Button>
    );
  }

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      <StreetViewContent
        ref={panoDivRef}
        handleClosePano={() => {
          handleClosePano();
          handleClearLayer();
        }}
      />
    </div>
  );
};

export default StreetView;
