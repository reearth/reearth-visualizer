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
import { FC, useMemo, useRef, useState } from "react";

import useHooks from "./hooks";

type Route = {
  id: string;
  label: string;
};

function normalizeHex(input: string) {
  let v = input.trim();
  if (!v) return "#FFFFFF";
  if (!v.startsWith("#")) v = `#${v}`;
  // allow typing; only force uppercase and max length
  v = v.toUpperCase().slice(0, 7);
  // basic guard
  if (v.length === 1) return "#";
  return v;
}

function isValidHex(v: string) {
  return /^#[0-9A-F]{6}$/.test(v);
}


const GoogleStreetView: FC= () => {
  const [collapsed, setCollapsed] = useState(true);

  const {
    routeHex,
    routeWidth,
    isDrawing,
    points,
    finishDrawing,
    startDrawing,
    setRouteHex,
    setRouteWidth
  } = useHooks();

  const [mode, setMode] = useState<string>("upload");
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [routes] = useState<Route[]>([
    { id: "route-1", label: "Main Street Loop" },
    { id: "route-2", label: "Downtown Walk" },
    { id: "route-3", label: "Warehouse Access" }
  ]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");

  const swatchColor = useMemo(() => {
    return isValidHex(routeHex) ? routeHex : "#FFFFFF";
  }, [routeHex]);

  const disabled = useMemo(() => {
    if (mode === "upload") {
      return !!file;
    }

    if (mode === "draw") return !isDrawing && points.length > 1;

    if (mode === "select") {
      return !!selectedRouteId;
    }

    return false;
  }, [mode, file, isDrawing, points.length, selectedRouteId]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="top-4 p-2 rounded-sm cursor-pointer"
        style={{ backgroundColor: "#171618" }}
      >
        <StreetView />
      </button>
    );
  }

  return (
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
        {/* Route Width */}
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
        {/* Route Color */}

        <div className="grid grid-cols-[1fr_200px] items-center gap-3">
          <div className="text-sm">Route Color</div>

          <div className="flex items-center gap-2">
            {/* Native HTML color picker */}
            <input
              type="color"
              value={swatchColor}
              onChange={(e) => setRouteHex(e.target.value.toUpperCase())}
              aria-label="Route color"
              className="h-8 w-10 p-0 rounded-sm border border-gray-300 cursor-pointer"
            />
            {/* Hex input */}
            <Input
              value={routeHex}
              onChange={(e) => setRouteHex(normalizeHex(e.target.value))}
              placeholder="#FFFFFF"
              className="h-7 px-2 bg-white border border-gray-300 rounded-sm shadow-sm"
            />
          </div>
        </div>

        {/* Make a route */}
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
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              style={{
                border: "1px solid #0f62fe",
                color: "#0f62fe",
                boxShadow: "none"
              }}
              className="w-full h-8 rounded-sm cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              disabled={mode !== "upload"}
            >
              Choose File
            </Button>

            {file ? (
              <div className="mt-2 text-xs truncate">Selected: {file.name}</div>
            ) : null}
          </div>
        )}
        {mode === "draw" && (
          <div className="pt-1">
            <Button
              type="button"
              variant={`${isDrawing ? "default" : "outline"}`}
              style={{
                border: "1px solid #0f62fe",
                boxShadow: "none",
                background: isDrawing ? "#0F62FE" : "transparent"
              }}
              className="w-full h-8 rounded-sm cursor-pointer"
              onClick={() => (isDrawing ? finishDrawing() : startDrawing())}
            >
              {isDrawing ? "Finish" : "Start Drawing"}
            </Button>
          </div>
        )}
        {/* Select mode: NEW "Route" selector listing uploaded files */}
        {mode === "select" && (
          <div className="grid grid-cols-[1fr_180px] items-center gap-3 pt-1">
            <div className="text-sm">Route</div>

            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger
                style={{ height: "30px" }}
                className="rounded-sm w-auto"
              >
                <SelectValue placeholder="Select route…" />
              </SelectTrigger>

              <SelectContent className="top-10">
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
              </SelectContent>
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
            cursor: disabled ? "not-allowed" : "pointer"
          }}
          onClick={() => {
            // setShowMap(true);
          }}
        >
          Start
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleStreetView;
