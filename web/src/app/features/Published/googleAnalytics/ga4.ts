import ReactGA from "react-ga4";

export function initialize(trackingId: string) {
  ReactGA.initialize(trackingId);
}

export function pageview(pathname: string) {
  ReactGA.send({ hitType: "pageview", page: pathname });
}
