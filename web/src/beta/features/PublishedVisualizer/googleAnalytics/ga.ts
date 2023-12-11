import ReactGA from "react-ga";

export function initialize(trackingId: string) {
  ReactGA.initialize(trackingId);
}

export function pageview(pathname: string) {
  ReactGA.pageview(pathname);
}
