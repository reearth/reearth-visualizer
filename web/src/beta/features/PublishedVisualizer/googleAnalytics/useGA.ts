import { useEffect } from "react";

export type GeneralGASettingsType = {
  enableGa?: boolean;
  trackingId?: string;
};

const isGa4TrackingId = (trackingId: string) => trackingId.startsWith("G-");

export const useGA = ({ enableGa, trackingId }: GeneralGASettingsType) => {
  useEffect(() => {
    const isEnabled = !!enableGa;

    if (!isEnabled || !trackingId) return;

    const loadGaModule = async () => {
      const gaModule = isGa4TrackingId(trackingId) ? await import("./ga4") : await import("./ga");
      gaModule.initialize(trackingId);
      gaModule.pageview(window.location.pathname);
    };

    loadGaModule();
  }, [enableGa, trackingId]);
};
