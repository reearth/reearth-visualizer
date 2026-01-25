import { Button } from "@reearth/app/lib/reearth-widget-ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@reearth/app/lib/reearth-widget-ui/components/ui/card";
import { Input } from "@reearth/app/lib/reearth-widget-ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@reearth/app/lib/reearth-widget-ui/components/ui/select";
import { Close, StreetView } from "@reearth/app/lib/reearth-widget-ui/icons";
import { FC, useRef, useState } from "react";

import type { ComponentProps as WidgetProps } from "../..";

import useHooks from "./hooks";
import { Property } from "./types";
import { normalizeHex } from "./utils";

type GoogleMapStreetViewProps = WidgetProps<Property>;

const GoogleMapStreetView: FC<GoogleMapStreetViewProps> = ({
  widget,
  context: {
    onSketchSetType,
    onLayerAdd,
    onFlyTo,
    onLayerOverride,
    onLayerDelete
  } = {}
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    themeClass,
    routeInputData,
    updateRouteInputData,
    disabled,
    panoDivRef,
    isDrawing,
    mode,
    selectRoutes,
    showPano,
    playState,
    handlePause,
    handleRestart,
    handleSelectRoute,
    handleStartSketchRoute,
    handleFinishSketchRoute,
    handleUploadFile,
    handleStreetViewStart,
    handleResume,
    handleChangeMode,
    resetOnClose
  } = useHooks({
    widget,
    onSketchSetType,
    onLayerAdd,
    onFlyTo,
    onLayerOverride,
    onLayerDelete
  });

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-2 w-8 h-8 rounded-sm cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: "#171618" }}
      >
        <StreetView />
      </button>
    );
  }

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      <Card className="p-0 left-4 w-[320px] rounded-sm border-none">
        <CardHeader className="p-3 flex flex-row items-center justify-between border-white/10 shadow-sm">
          <div className="flex items-center gap-2 m-0">
            <StreetView />
            <h4 className="text-sm">Street View</h4>
          </div>
          <div
            onClick={() => {
              setCollapsed(true);
              resetOnClose();
            }}
          >
            <Close className="w-5 h-5 cursor-pointer" />
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-4 space-y-3 text-xs">
          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div>Route Width</div>
            <Input
              type="number"
              min={1}
              step={1}
              defaultValue={routeInputData.routeWidth}
              onBlur={(e) => {
                const v = e.currentTarget.valueAsNumber;
                updateRouteInputData({ routeWidth: Number.isNaN(v) ? 1 : v });
              }}
              style={{ padding: "0 4px" }}
              className="h-7 border border-gray-300 rounded-sm shadow-sm"
            />
          </div>

          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div>Route Color</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  routeInputData.routeColor
                    ? routeInputData.routeColor
                    : "#FFFFFF"
                }
                onChange={(e) =>
                  updateRouteInputData({ routeColor: e.target.value })
                }
                aria-label="Route color"
                className="h-8 w-10 p-0 rounded-sm border border-gray-300 cursor-pointer"
              />
              <Input
                value={routeInputData.routeColor}
                onChange={(e) =>
                  updateRouteInputData({
                    routeColor: normalizeHex(e.target.value)
                  })
                }
                placeholder="#FFFFFF"
                style={{ padding: "0 4px" }}
                className="h-7 border border-gray-300 rounded-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div>Make a route</div>
            <Select value={mode} onValueChange={handleChangeMode}>
              <SelectTrigger
                style={{
                  height: "30px",
                  border: "1px solid #d1d5dc",
                  padding: "0 4px"
                }}
                className="h-7 rounded-sm w-auto shadow-sm text-xs py-4"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent className="top-8">
                <SelectItem
                  className="data-[state=checked]:bg-[#3b3cd0] data-[state=checked]:text-white text-xs"
                  value="upload"
                >
                  Upload a file
                </SelectItem>
                <SelectItem
                  className="data-[state=checked]:bg-[#3b3cd0] data-[state=checked]:text-white text-xs"
                  value="draw"
                >
                  Draw a route
                </SelectItem>
                <SelectItem
                  className="data-[state=checked]:bg-[#3b3cd0] data-[state=checked]:text-white text-xs"
                  value="select"
                >
                  Select a route
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "upload" && (
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (!f) {
                    updateRouteInputData({ file: null });
                    return;
                  }
                  void handleUploadFile(f);
                }}
              />
              <Button
                type="button"
                className="w-full h-8 rounded-sm cursor-pointer text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={mode !== "upload"}
              >
                Choose File
              </Button>

              {routeInputData.file ? (
                <div className="mt-2 truncate">
                  Uploaded file: {routeInputData.file.name}
                </div>
              ) : null}
            </div>
          )}

          {mode === "draw" && (
            <div className="pt-1">
              <Button
                type="button"
                className="w-full h-8 rounded-sm cursor-pointer text-xs"
                onClick={() =>
                  isDrawing
                    ? handleFinishSketchRoute()
                    : handleStartSketchRoute()
                }
              >
                {isDrawing ? "Finish" : "Start Drawing"}
              </Button>
            </div>
          )}

          {mode === "select" && (
            <div className="grid grid-cols-[1fr_200px] items-center gap-3 pt-1">
              Route
              <Select
                value={routeInputData.selectedRoute}
                onValueChange={handleSelectRoute}
              >
                <SelectTrigger
                  style={{
                    height: "30px",
                    border: "1px solid #d1d5dc",
                    padding: "0 4px"
                  }}
                  className="rounded-sm w-auto"
                >
                  <SelectValue placeholder="Select route…" />
                </SelectTrigger>
                <SelectContent className="top-8">
                  {selectRoutes && selectRoutes.length > 0 ? (
                    selectRoutes.map((route) => (
                      <SelectItem
                        className="data-[state=checked]:bg-[#3b3cd0] data-[state=checked]:text-white text-xs"
                        key={route.id}
                        value={route.fileUrl}
                      >
                        {route.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-2">No routes available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-8 rounded-sm text-xs"
            disabled={playState !== "playing"}
            onClick={handleRestart}
          >
            Restart
          </Button>

          {playState === "playing" ? (
            <Button
              type="button"
              className="flex-1 h-8 rounded-sm text-xs"
              onClick={handlePause}
            >
              Pause
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 h-8 rounded-sm text-xs"
              disabled={!disabled}
              onClick={() => {
                if (!showPano) {
                  handleStreetViewStart();
                } else {
                  handleResume();
                }
              }}
            >
              Start
            </Button>
          )}
        </CardFooter>

        {showPano ? (
          <div className="px-3 pb-3">
            <div
              ref={panoDivRef}
              className="w-full rounded-sm border h-56 border-white/10 overflow-hidden"
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default GoogleMapStreetView;
