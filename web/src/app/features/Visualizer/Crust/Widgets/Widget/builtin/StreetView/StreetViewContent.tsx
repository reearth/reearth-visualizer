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
  apiKey?: string;
  theme?: "light" | "dark";
  handleClosePano: () => void;
};

const StreetViewContent = forwardRef<HTMLDivElement, StreetViewContentProps>(
  ({ handleClosePano, isTracking, theme, apiKey }, ref) => {
    const t = useT();

    return (
      <Card
        className="p-0 w-[440px] rounded-sm border-none"
        style={{
          background: theme === "dark" ? "#292929" : undefined,
          color: theme === "dark" ? "#E0E0E0" : undefined
        }}
      >
        <CardHeader className="flex flex-row p-1 justify-between items-center">
          <div className="flex m-0 items-center gap-2">
            <Pegman className="h-5 w-5" />
            <p className="text-sm">{t("Street View")}</p>
          </div>
          <div onClick={handleClosePano} className="cursor-pointer px-0.5">
            <Close />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isTracking ? (
            <div className="px-2 py-1 text-xs">
              {t("Select a location on the map to view Street View")}
            </div>
          ) : apiKey ? (
            <div ref={ref} className="w-full h-[250px] overflow-hidden" />
          ) : (
            <div className="px-2 pb-1 text-xs">
              {t("Please provide the API key")}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StreetViewContent.displayName = "StreetViewContent";

export default StreetViewContent;
