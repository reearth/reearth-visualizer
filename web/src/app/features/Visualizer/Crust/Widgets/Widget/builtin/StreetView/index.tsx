import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import { FC } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import useHooks from "./hooks";
import StreetViewContent from "./StreetViewContent";
import { Property } from "./types";
import { useEvent } from "./useEvents";

type Props = WidgetProps<Property>;

const StreetView: FC<Props> = ({ widget }) => {
  const { layer, showPano, setShowPano, handleTracking, handleClearLayer } =
    useEvent();
  const { themeClass, panoDivRef, collapsed, handleClosePano, setCollapsed } =
    useHooks({
      widget,
      layer,
      setShowPano
    });

  if (collapsed) {
    return (
      <Button
        type="button"
        size="sm"
        className="w-20 rounded-sm text-xs"
        onClick={() => {
          handleTracking(true);
          setCollapsed(false);
        }}
      >
        Street View
      </Button>
    );
  }

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      <StreetViewContent
        showPano={showPano}
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
