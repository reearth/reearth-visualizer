import { isValidHex, normalizeHex } from "@reearth/app/features/Visualizer/Crust/utils";
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
import { CommonBuiltInWidgetProperty } from "../types";

import useHooks from "./hooks";

export type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiKey?: string;
  };
};
type GoogleMapStreetViewProps = WidgetProps<Property>;

const GoogleMapStreetView: FC<GoogleMapStreetViewProps> = ({
  widget,
  context: {
    onSketchSetType,
    onLayerAdd,
    onFlyTo,
    onLayerOverride,
  } = {}
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    themeClass,
    routeWidth,
    disabled,
    panoDivRef,
    setRouteWidth,
    routeHex,
    setRouteHex,
    isDrawing,
    mode,
    setMode,
    selectedRouteId,
    setSelectedRouteId,
    showPano,
    handleStartSketchRoute,
    finishDrawing,
    handleUploadFile,
    handleStreetViewStart,
  } = useHooks({
    widget,
    onSketchSetType,
    onLayerAdd,
    onFlyTo,
    onLayerOverride,
  });

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="top-4 p-2 rounded-sm cursor-pointer"
      >
        <StreetView />
      </button>
    );
  }

  return (
    <div className={themeClass} data-theme-debug={themeClass}>
      <Card className="p-0 left-4 w-[340px] rounded-sm border-none">
        <CardHeader className="p-3 flex flex-row items-center justify-between border-white/10 shadow-sm">
          <div className="flex items-center gap-2 m-0">
            <StreetView />
            <div>Street View</div>
          </div>
          <div onClick={() => setCollapsed(true)}>
            <Close className="w-5 h-5 cursor-pointer" />
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-4 space-y-3">
          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div className="text-sm">Route Width</div>
            <Input
              type="number"
              min={1}
              step={1}
              defaultValue={routeWidth}
              onBlur={(e) => {
                const v = e.currentTarget.valueAsNumber;
                setRouteWidth(Number.isNaN(v) ? 1 : v);
              }}
              style={{
                padding: "0 4px"
              }}
              className="h-7 p-4 border border-gray-300 rounded-sm shadow-sm"
            />
          </div>

          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div className="text-sm">Route Color</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={isValidHex(routeHex) ? routeHex : "#FFFFFF"}
                onChange={(e) => setRouteHex(e.target.value.toUpperCase())}
                aria-label="Route color"
                className="h-8 w-10 p-0 rounded-sm border border-gray-300 cursor-pointer"
              />
              <Input
                value={routeHex}
                onChange={(e) => setRouteHex(normalizeHex(e.target.value))}
                placeholder="#FFFFFF"
                className="h-7 px-2 bg-white border border-gray-300 rounded-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_200px] items-center gap-3">
            <div className="text-sm">Make a route</div>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger
                style={{
                  height: "30px",
                  border: "1px solid #d1d5dc",
                  padding: "0 4px"
                }}
                className="rounded-sm w-auto shadow-sm"
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent className="top-9">
                <SelectItem
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                  value="upload"
                >
                  Upload a file
                </SelectItem>
                <SelectItem
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                  value="draw"
                >
                  Draw a route
                </SelectItem>
                <SelectItem
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
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
                  setFile(f);
                  if (f) void handleUploadFile(f);
                }}
              />
              <Button
                type="button"
                className="w-full h-8 rounded-sm cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                disabled={mode !== "upload"}
              >
                Choose File
              </Button>

              {file ? (
                <div className="mt-2 text-xs truncate">
                  Uploaded file: {file.name}
                </div>
              ) : null}
            </div>
          )}
          {mode === "draw" && (
            <div className="pt-1">
              <Button
                type="button"
                className="w-full h-8 rounded-sm cursor-pointer"
                onClick={() =>
                  isDrawing ? finishDrawing() : handleStartSketchRoute()
                }
              >
                {isDrawing ? "Finish" : "Start Drawing"}
              </Button>
            </div>
          )}
          {mode === "select" && (
            <div className="grid grid-cols-[1fr_200px] items-center gap-3 pt-1">
              <div className="text-sm">Route</div>

              <Select
                value={selectedRouteId}
                onValueChange={setSelectedRouteId}
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
                {/* <SelectContent className="top-8">
                  {routes.length > 0 ? (
                    routes.map((route) => (
                      <SelectItem
                        className=" data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        key={route.id}
                        value={route.id}
                      >
                        {route.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-xs">No routes available</div>
                  )}
                </SelectContent> */}
              </Select>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 h-8 rounded-sm bg-gray-400"
            disabled={!disabled}
            onClick={() => {
              // restart logic
            }}
          >
            Restart
          </Button>
          <Button
            type="button"
            variant={`${disabled ? "default" : "secondary"}`}
            className="flex-1 h-8 rounded-sm bg-gray-400"
            disabled={!disabled}
            style={{
              cursor: !disabled ? "not-allowed" : "pointer"
            }}
            onClick={() => {
              handleStreetViewStart();
            }}
          >
            Start
          </Button>
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
