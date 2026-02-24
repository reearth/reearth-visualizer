import {
  Card,
  CardContent,
  CardHeader
} from "@reearth/app/lib/reearth-widget-ui/components/ui/card";
import { Close, Pegman } from "@reearth/app/lib/reearth-widget-ui/icons";
import { useT } from "@reearth/services/i18n/hooks";
import { forwardRef } from "react";

export type StreetViewContentProps = {
  isTracking?: boolean;
  theme?: "light" | "dark";
  handleClosePano: () => void;
};

const StreetViewContent = forwardRef<HTMLDivElement, StreetViewContentProps>(
  ({ handleClosePano, isTracking, theme }, ref) => {
    const t = useT();
    return (
      <Card
        className="p-0 w-[440px] rounded-sm border-none"
        style={{
          background: theme === "dark" ? "#292929" : "",
          color: theme === "dark" ? "#E0E0E0" : ""
        }}
      >
        <CardHeader className="flex flex-row p-1 justify-between items-center">
          <div className="flex items-center">
            <Pegman className="h-6 w-6" />
            <div className="text-sm">{t("Street View")}</div>
          </div>
          <div onClick={handleClosePano} className="cursor-pointer">
            <Close className="w-5 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isTracking ? (
            <div className="px-2 pb-1 text-xs">
              {t("Select a location on the map to view Street View")}
            </div>
          ) : (
            <div ref={ref} className="w-full h-62 overflow-hidden" />
          )}
        </CardContent>
      </Card>
    );
  }
);

StreetViewContent.displayName = "StreetViewContent";

export default StreetViewContent;
