import { useMeFetcher } from "@reearth/services/api";

export default (workspaceId?: string) => {
  const { useMeQuery } = useMeFetcher();
  const { me: currentUser } = useMeQuery();

  console.log("workspaceId", workspaceId);
  return {
    currentUser,
  };
};
