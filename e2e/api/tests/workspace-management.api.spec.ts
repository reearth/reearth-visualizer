import { faker } from "@faker-js/faker";

import { SECOND_USER_EMAIL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_WORKSPACE,
  UPDATE_WORKSPACE,
  DELETE_WORKSPACE,
  ADD_MEMBER_TO_WORKSPACE,
  REMOVE_MEMBER_FROM_WORKSPACE,
  UPDATE_MEMBER_OF_WORKSPACE
} from "../graphql/mutations";
import {
  GET_ME,
  GET_WORKSPACE,
  SEARCH_USER,
  WORKSPACE_POLICY_CHECK
} from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Workspace CRUD lifecycle via API", () => {
  let createdWorkspaceId: string;
  const workspaceName = faker.company.name();

  test.afterAll(async ({ gqlClient }) => {
    if (!createdWorkspaceId) return;
    try {
      await gqlClient.mutate(DELETE_WORKSPACE, {
        input: { workspaceId: createdWorkspaceId }
      });
    } catch {
      // already deleted by the test or does not exist
    }
  });

  test("Get current user info", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      me: { id: string; email: string; myWorkspaceId: string };
    }>(GET_ME);

    expect(status).toBe(200);
    expect(data.me.id).toBeTruthy();
  });

  test("Create a new workspace", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createWorkspace: {
        workspace: {
          id: string;
          name: string;
          personal: boolean;
        };
      };
    }>(CREATE_WORKSPACE, { input: { name: workspaceName } });

    expect(status).toBe(200);
    const ws = data.createWorkspace.workspace;
    expect(ws.name).toBe(workspaceName);
    expect(ws.personal).toBe(false);
    createdWorkspaceId = ws.id;
  });

  test("Read back the workspace", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      node: {
        id: string;
        name: string;
        personal: boolean;
        members: { userId: string; role: string }[];
      };
    }>(GET_WORKSPACE, { workspaceId: createdWorkspaceId });

    expect(status).toBe(200);
    expect(data.node.id).toBe(createdWorkspaceId);
    expect(data.node.name).toBe(workspaceName);
    expect(data.node.personal).toBe(false);
  });

  test("Update workspace name", async ({ gqlClient }) => {
    const newName = `${workspaceName} Updated`;
    const { status, data } = await gqlClient.mutate<{
      updateWorkspace: { workspace: { id: string; name: string } };
    }>(UPDATE_WORKSPACE, {
      input: { workspaceId: createdWorkspaceId, name: newName }
    });

    expect(status).toBe(200);
    expect(data.updateWorkspace.workspace.name).toBe(newName);
  });

  test("Policy check on workspace", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      workspacePolicyCheck: {
        workspaceId: string;
        enableToCreatePrivateProject: boolean;
      } | null;
    }>(WORKSPACE_POLICY_CHECK, {
      input: { workspaceId: createdWorkspaceId }
    });

    expect(status).toBe(200);
    // Policy check may return null if no policy is configured
    if (data.workspacePolicyCheck) {
      expect(data.workspacePolicyCheck.workspaceId).toBe(createdWorkspaceId);
    }
  });

  test("Delete the created workspace", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      deleteWorkspace: { workspaceId: string };
    }>(DELETE_WORKSPACE, { input: { workspaceId: createdWorkspaceId } });

    expect(status).toBe(200);
    expect(data.deleteWorkspace.workspaceId).toBe(createdWorkspaceId);
    createdWorkspaceId = "";
  });
});

test.describe("Workspace negative scenarios via API", () => {
  let myWorkspaceId: string;
  let myUserId: string;
  const tempWorkspaceIds: string[] = [];

  test.afterAll(async ({ gqlClient }) => {
    for (const wsId of tempWorkspaceIds) {
      try {
        await gqlClient.mutate(DELETE_WORKSPACE, {
          input: { workspaceId: wsId }
        });
      } catch {
        // already deleted or does not exist
      }
    }
  });

  test("Setup: get user context", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.query<{
      me: { id: string; myWorkspaceId: string };
    }>(GET_ME);
    expect(status).toBe(200);
    myUserId = data.me.id;
    myWorkspaceId = data.me.myWorkspaceId;
  });

  test("Cannot create workspace with empty name", async ({ gqlClient }) => {
    await expect(
      gqlClient.mutate(CREATE_WORKSPACE, { input: { name: "" } })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent workspace", async ({ gqlClient }) => {
    const fakeId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_WORKSPACE, {
        input: { workspaceId: fakeId, name: "Ghost" }
      })
    ).rejects.toThrow();
  });

  test("Cannot delete a non-existent workspace", async ({ gqlClient }) => {
    const fakeId = generateFakeId();
    await expect(
      gqlClient.mutate(DELETE_WORKSPACE, { input: { workspaceId: fakeId } })
    ).rejects.toThrow();
  });

  test("Cannot delete personal workspace", async ({ gqlClient }) => {
    await expect(
      gqlClient.mutate(DELETE_WORKSPACE, {
        input: { workspaceId: myWorkspaceId }
      })
    ).rejects.toThrow();
  });

  test("Adding non-existent user does not add them to members", async ({
    gqlClient
  }) => {
    const fakeUserId = generateFakeId();
    const { data: wsData } = await gqlClient.mutate<{
      createWorkspace: { workspace: { id: string } };
    }>(CREATE_WORKSPACE, {
      input: { name: `Neg Test ${faker.string.alphanumeric(6)}` }
    });
    const wsId = wsData.createWorkspace.workspace.id;
    tempWorkspaceIds.push(wsId);

    // Server may either throw an error or silently ignore the non-existent user
    try {
      const { data } = await gqlClient.mutate<{
        addMemberToWorkspace: {
          workspace: {
            id: string;
            members: { userId: string; role: string }[];
          };
        };
      }>(ADD_MEMBER_TO_WORKSPACE, {
        input: { workspaceId: wsId, userId: fakeUserId, role: "READER" }
      });

      // If it didn't throw, verify the fake user was not actually added
      const fakeMember = data.addMemberToWorkspace.workspace.members.find(
        (m) => m.userId === fakeUserId
      );
      expect(fakeMember).toBeUndefined();
    } catch (error: unknown) {
      // Only accept user-not-found related errors; rethrow unexpected ones
      const msg = error instanceof Error ? error.message : String(error);
      expect(msg.toLowerCase()).toMatch(/not found|does not exist|user|invalid id|unprocessable/);
    }
  });

  test("Cannot remove yourself (owner) from workspace", async ({
    gqlClient
  }) => {
    const { data: wsData } = await gqlClient.mutate<{
      createWorkspace: { workspace: { id: string } };
    }>(CREATE_WORKSPACE, {
      input: { name: `Neg Owner ${faker.string.alphanumeric(6)}` }
    });
    const wsId = wsData.createWorkspace.workspace.id;
    tempWorkspaceIds.push(wsId);

    await expect(
      gqlClient.mutate(REMOVE_MEMBER_FROM_WORKSPACE, {
        input: { workspaceId: wsId, userId: myUserId }
      })
    ).rejects.toThrow();
  });

  test("Cannot add member to non-existent workspace", async ({
    gqlClient
  }) => {
    const fakeWsId = generateFakeId();
    await expect(
      gqlClient.mutate(ADD_MEMBER_TO_WORKSPACE, {
        input: { workspaceId: fakeWsId, userId: myUserId, role: "READER" }
      })
    ).rejects.toThrow();
  });

  test("Read non-existent workspace returns null", async ({ gqlClient }) => {
    const fakeId = generateFakeId();
    const { status, data } = await gqlClient.query<{
      node: { id: string } | null;
    }>(GET_WORKSPACE, { workspaceId: fakeId });

    expect(status).toBe(200);
    expect(data.node).toBeNull();
  });

  test("Search for non-existent user throws an error", async ({ gqlClient }) => {
    await expect(
      gqlClient.query(SEARCH_USER, {
        nameOrEmail: `nonexistent_${faker.string.alphanumeric(20)}@nowhere.test`
      })
    ).rejects.toThrow(/not found/i);
  });
});

test.describe("Workspace member management via API", () => {
  let targetUserId: string;
  let workspaceId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!workspaceId) return;
    try {
      await gqlClient.mutate(DELETE_WORKSPACE, {
        input: { workspaceId }
      });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create workspace and resolve second user", async ({
    gqlClient
  }) => {
    test.skip(!SECOND_USER_EMAIL, "REEARTH_E2E_SECOND_USER_EMAIL not set");

    const { status: wsStatus, data: wsData } = await gqlClient.mutate<{
      createWorkspace: { workspace: { id: string } };
    }>(CREATE_WORKSPACE, {
      input: { name: `Member Test ${faker.string.alphanumeric(6)}` }
    });
    expect(wsStatus).toBe(200);
    workspaceId = wsData.createWorkspace.workspace.id;

    const { status, data } = await gqlClient.query<{
      searchUser: { id: string; name: string; email: string } | null;
    }>(SEARCH_USER, { nameOrEmail: SECOND_USER_EMAIL });
    expect(status).toBe(200);
    expect(data.searchUser).not.toBeNull();
    targetUserId = data.searchUser?.id ?? "";
  });

  test("Add member as READER", async ({ gqlClient }) => {
    test.skip(!targetUserId, "Second user not resolved");

    const { status, data } = await gqlClient.mutate<{
      addMemberToWorkspace: {
        workspace: { id: string; members: { userId: string; role: string }[] };
      };
    }>(ADD_MEMBER_TO_WORKSPACE, {
      input: { workspaceId, userId: targetUserId, role: "READER" }
    });

    expect(status).toBe(200);
    const added = data.addMemberToWorkspace.workspace.members.find(
      (m) => m.userId === targetUserId
    );
    expect(added).toBeDefined();
    expect(added?.role).toBe("READER");
  });

  test("Update member role to WRITER", async ({ gqlClient }) => {
    test.skip(!targetUserId, "Second user not resolved");

    const { status, data } = await gqlClient.mutate<{
      updateMemberOfWorkspace: {
        workspace: { members: { userId: string; role: string }[] };
      };
    }>(UPDATE_MEMBER_OF_WORKSPACE, {
      input: { workspaceId, userId: targetUserId, role: "WRITER" }
    });

    expect(status).toBe(200);
    const updated = data.updateMemberOfWorkspace.workspace.members.find(
      (m) => m.userId === targetUserId
    );
    expect(updated).toBeDefined();
    expect(updated?.role).toBe("WRITER");
  });

  test("Remove member from workspace", async ({ gqlClient }) => {
    test.skip(!targetUserId, "Second user not resolved");

    const { status, data } = await gqlClient.mutate<{
      removeMemberFromWorkspace: {
        workspace: { id: string; members: { userId: string; role: string }[] };
      };
    }>(REMOVE_MEMBER_FROM_WORKSPACE, {
      input: { workspaceId, userId: targetUserId }
    });

    expect(status).toBe(200);
    const remaining = data.removeMemberFromWorkspace.workspace.members;
    expect(remaining.find((m) => m.userId === targetUserId)).toBeUndefined();
  });

  test("Cleanup: delete test workspace", async ({ gqlClient }) => {
    test.skip(!workspaceId, "Workspace not created");

    const { status, data } = await gqlClient.mutate<{
      deleteWorkspace: { workspaceId: string };
    }>(DELETE_WORKSPACE, { input: { workspaceId } });

    expect(status).toBe(200);
    expect(data.deleteWorkspace.workspaceId).toBe(workspaceId);
    workspaceId = "";
  });
});
