import { useEffect } from "react";
import ReactGA from "react-ga4";

export type GeneralGASettingsType = {
  enableGa?: boolean;
  trackingId?: string;
};

export const useGA = ({ enableGa, trackingId }: GeneralGASettingsType) => {
  useEffect(() => {
    const isEnabled = !!enableGa;

    if (!isEnabled || !trackingId) return;

    ReactGA.initialize(trackingId);
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, [enableGa, trackingId]);
};
