import {
  Card,
  CardContent,
  CardHeader
} from "@reearth/app/lib/reearth-widget-ui/components/ui/card";
import { Close, Pegman } from "@reearth/app/lib/reearth-widget-ui/icons";
import { forwardRef } from "react";

export interface StreetViewContentProps {
  handleClosePano: () => void;
}

const StreetViewContent = forwardRef<HTMLDivElement, StreetViewContentProps>(
  ({ handleClosePano }, ref) => {
    return (
      <Card className="p-0 w-[550px] rounded-sm border-none">
        <CardHeader className="flex flex-row p-2 justify-between items-center border-white/10 shadow-sm">
          <div className="flex items-center gap-2">
            <Pegman />
            <h4 className="text-sm m-0">Street View</h4>
          </div>
          <div onClick={handleClosePano} className="cursor-pointer">
            <Close className="w-5 h-5" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            ref={ref}
            className="w-full h-76 border border-white/10 rounded-sm overflow-hidden"
          />
        </CardContent>
      </Card>
    );
  }
);

StreetViewContent.displayName = "StreetViewContent";

export default StreetViewContent;
