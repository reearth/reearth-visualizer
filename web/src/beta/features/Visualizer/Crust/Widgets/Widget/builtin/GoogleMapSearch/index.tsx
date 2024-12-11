import { Card } from "@reearth/beta/lib/reearth-widget-ui/components/ui/card";
import { Input } from "@reearth/beta/lib/reearth-widget-ui/components/ui/input";
import { Search } from "lucide-react";
import { FC, useMemo } from "react";

import type { ComponentProps as WidgetProps } from "../..";
import { CommonBuiltInWidgetProperty } from "../types";

type Property = CommonBuiltInWidgetProperty & {
  default?: {
    apiToken?: string;
  };
};
type GoogleMapSearchProps = WidgetProps<Property>;

const GoogleMapSearch: FC<GoogleMapSearchProps> = ({ widget }) => {
  const theme = useMemo(
    () => widget.property?.appearance?.theme ?? "light",
    [widget.property?.appearance?.theme]
  );

  return (
    <div className={theme}>
      <Card className="tw-pl-3 tw-w-[400px] tw-flex tw-items-center tw-bg-background tw-text-foreground tw-rounded-md tw-border-0">
        <span className="tw-text-foreground">
          <Search className="tw-w-5 tw-h-5" />
        </span>
        <Input
          className={"tw-border-0"}
          placeholder="Type a keyword to search..."
        />
      </Card>
    </div>
  );
};

export default GoogleMapSearch;
