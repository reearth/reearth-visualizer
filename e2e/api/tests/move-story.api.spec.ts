import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  CREATE_STORY,
  DELETE_PROJECT,
  MOVE_STORY
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

test.describe.configure({ mode: "serial" });
test.describe("Move story via API", () => {
  let projectId: string;
  let sceneId: string;
  let storyId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project, scene, and story", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Move Story Test",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;

    const { data: s } = await gqlClient.mutate<{
      createStory: { story: { id: string } };
    }>(CREATE_STORY, {
      input: { sceneId, title: "Story A", index: 0 }
    });
    storyId = s.createStory.story.id;
  });

  test.fixme("Move story to index 0", async ({ gqlClient }) => {
    // Server returns "not implemented" for moveStory mutation
    const { status, data } = await gqlClient.mutate<{
      moveStory: {
        storyId: string;
        index: number;
        stories: { id: string }[];
      };
    }>(MOVE_STORY, {
      input: { sceneId, storyId, index: 0 }
    });

    expect(status).toBe(200);
    expect(data.moveStory.storyId).toBe(storyId);
    expect(data.moveStory.stories[0].id).toBe(storyId);
  });
});

// Negative scenarios
test.describe("Move story negative scenarios", () => {
  test("Cannot move a non-existent story", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeStoryId = generateFakeId();
    await expect(
      gqlClient.mutate(MOVE_STORY, {
        input: { sceneId: fakeSceneId, storyId: fakeStoryId, index: 0 }
      })
    ).rejects.toThrow();
  });
});
