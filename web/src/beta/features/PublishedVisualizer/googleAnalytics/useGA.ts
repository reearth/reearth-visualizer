import { useEffect } from "react";

export type GeneralGASettingsType = {
  enableGA?: boolean;
  trackingId?: string;
};

const isGa4TrackingId = (trackingId: string) => trackingId.startsWith("G-");

export const useGA = ({ enableGA, trackingId }: GeneralGASettingsType) => {
  useEffect(() => {
    const isEnabled = !!enableGA;

    if (!isEnabled || !trackingId) return;

    const loadGaModule = async () => {
      const gaModule = isGa4TrackingId(trackingId) ? await import("./ga4") : await import("./ga");
      gaModule.initialize(trackingId);
      gaModule.pageview(window.location.pathname);
    };

    loadGaModule();
  }, [enableGA, trackingId]);
};
