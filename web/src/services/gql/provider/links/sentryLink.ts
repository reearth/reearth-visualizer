import { SentryLink } from "apollo-link-sentry";

export default (endpoint: string) => {
  return new SentryLink({ uri: endpoint });
};
