import { Banner } from "@reearth/app/lib/reearth-ui";
import { FC, ReactNode } from "react";

export type WarningBannerProps = {
  children: ReactNode;
  "data-testid"?: string;
};

/**
 * @deprecated Use Banner component with variant="warning" instead
 */
const WarningBanner: FC<WarningBannerProps> = ({ children, ...props }) => {
  return (
    <Banner
      variant="warning"
      data-testid={props["data-testid"] || "warning-banner"}
    >
      {children}
    </Banner>
  );
};

export default WarningBanner;
