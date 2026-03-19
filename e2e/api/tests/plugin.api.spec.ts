import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  INSTALL_PLUGIN,
  UNINSTALL_PLUGIN,
  UPGRADE_PLUGIN
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });
test.describe("Plugin install/uninstall lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project and scene", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Plugin Test Project",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;
  });

  test.skip(
    "Uninstall and re-install the reearth plugin",
    // Server returns "not found" when uninstalling the built-in reearth plugin.
    // The built-in plugin cannot be managed via install/uninstall mutations.
    async ({ gqlClient }) => {
      const { status: uninstallStatus, data: uninstallData } =
        await gqlClient.mutate<{
          uninstallPlugin: {
            pluginId: string;
            scene: { id: string };
          };
        }>(UNINSTALL_PLUGIN, {
          input: { sceneId, pluginId: "reearth" }
        });

      expect(uninstallStatus).toBe(200);
      expect(uninstallData.uninstallPlugin.pluginId).toBe("reearth");

      const { status: installStatus, data: installData } =
        await gqlClient.mutate<{
          installPlugin: {
            scene: { id: string };
            scenePlugin: { pluginId: string };
          };
        }>(INSTALL_PLUGIN, {
          input: { sceneId, pluginId: "reearth" }
        });

      expect(installStatus).toBe(200);
      expect(installData.installPlugin.scenePlugin.pluginId).toBe("reearth");
    }
  );
});

// Negative scenarios
test.describe("Plugin negative scenarios", () => {
  test("Cannot install plugin to a non-existent scene", async ({
    gqlClient
  }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(INSTALL_PLUGIN, {
        input: { sceneId: fakeSceneId, pluginId: "reearth" }
      })
    ).rejects.toThrow();
  });

  test("Cannot uninstall plugin from a non-existent scene", async ({
    gqlClient
  }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(UNINSTALL_PLUGIN, {
        input: { sceneId: fakeSceneId, pluginId: "reearth" }
      })
    ).rejects.toThrow();
  });

  test("Cannot install a non-existent plugin", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Plugin Neg Test",
        coreSupport: true
      }
    });
    const projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    const sceneId = sc.createScene.scene.id;

    try {
      await expect(
        gqlClient.mutate(INSTALL_PLUGIN, {
          input: { sceneId, pluginId: "non-existent-plugin-id" }
        })
      ).rejects.toThrow();
    } finally {
      await gqlClient
        .mutate(DELETE_PROJECT, { input: { projectId } })
        .catch(() => {});
    }
  });

  test("Cannot upgrade a non-existent plugin", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(UPGRADE_PLUGIN, {
        input: {
          sceneId: fakeSceneId,
          pluginId: "reearth",
          toPluginId: "reearth-v2"
        }
      })
    ).rejects.toThrow();
  });
});
