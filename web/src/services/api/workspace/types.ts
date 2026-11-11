import { CreateWorkspaceMutation } from "@reearth/services/gql";

export type Workspace = NonNullable<
  CreateWorkspaceMutation["createWorkspace"]
>["workspace"];

export type WorkspaceMember = Workspace["members"][number];
