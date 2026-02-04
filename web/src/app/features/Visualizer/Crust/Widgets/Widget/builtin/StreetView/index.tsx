import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader
} from "@reearth/app/lib/reearth-widget-ui/components/ui/card";
import { Close, Pedman } from "@reearth/app/lib/reearth-widget-ui/icons";
import { FC } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import useHooks from "./hooks";
import { Property } from "./types";

type StreetViewProps = WidgetProps<Property>;

const StreetView: FC<StreetViewProps> = ({ widget }) => {
  const {
    themeClass,
    handleTracking,
    panoDivRef,
    showPano,
    collapsed,
    handleClosePano
  } = useHooks({
    widget
  });


  if (collapsed) {
    return (
      <Button
        type="button"
        size="sm"
        className="w-20 rounded-sm cursor-pointer text-xs"
        onClick={() => {
          handleTracking(true);
        }}
      >
        Street View
      </Button>
    );
  }

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      {showPano ? (
        <Card className="p-0 w-[550px] rounded-sm border-none">
          <CardHeader className="p-3 flex flex-row items-center justify-between border-white/10 shadow-sm">
            <div className="flex items-center gap-2 m-0">
              <Pedman />
              <h4 className="text-sm">Street View</h4>
            </div>
            <div onClick={handleClosePano}>
              <Close className="w-5 h-5 cursor-pointer" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div
              ref={panoDivRef}
              className="w-full rounded-sm border h-76 border-white/10 overflow-hidden"
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default StreetView;
