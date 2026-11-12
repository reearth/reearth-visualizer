import { setContext } from "@apollo/client/link/context";
import { getCurrentWorkspaceId } from "@reearth/services/state";

export const workspaceHeader = "X-Workspace-Id";

export const withWorkspaceHeader = (
  headers: Record<string, string> | undefined,
  workspaceId: string | undefined
): Record<string, string> | undefined => {
  if (!workspaceId) return headers;
  return { ...headers, [workspaceHeader]: workspaceId };
};

export default () => {
  return setContext(async (_, { headers }) => ({
    headers: withWorkspaceHeader(headers, getCurrentWorkspaceId())
  }));
};
