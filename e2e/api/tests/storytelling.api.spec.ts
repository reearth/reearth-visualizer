import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  ADD_PAGE_LAYER,
  CREATE_PROJECT,
  CREATE_SCENE,
  CREATE_STORY,
  CREATE_STORY_BLOCK,
  CREATE_STORY_PAGE,
  DELETE_PROJECT,
  DELETE_STORY,
  DUPLICATE_STORY_PAGE,
  MOVE_STORY_BLOCK,
  MOVE_STORY_PAGE,
  REMOVE_PAGE_LAYER,
  REMOVE_STORY_BLOCK,
  REMOVE_STORY_PAGE,
  UPDATE_STORY,
  UPDATE_STORY_PAGE
} from "../graphql/mutations";
import { CHECK_STORY_ALIAS, GET_ME } from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

type StoryPage = { id: string; title: string; swipeable?: boolean };
type StoryBlock = { id: string; pluginId: string; extensionId: string };

test.describe.configure({ mode: "serial" });
test.describe("Story CRUD lifecycle via API", () => {
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
        name: "Story Test Project",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;
  });

  test("Create a story", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createStory: { story: { id: string } };
    }>(CREATE_STORY, {
      input: { sceneId, title: "Main Story", index: 0 }
    });

    expect(status).toBe(200);
    expect(data.createStory.story.id).toBeTruthy();
    storyId = data.createStory.story.id;
  });

  test("Update story title and panel position", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateStory: {
        story: { id: string; title: string; panelPosition: string };
      };
    }>(UPDATE_STORY, {
      input: {
        sceneId,
        storyId,
        title: "Updated Story",
        panelPosition: "RIGHT"
      }
    });

    expect(status).toBe(200);
    expect(data.updateStory.story.title).toBe("Updated Story");
    expect(data.updateStory.story.panelPosition).toBe("RIGHT");
  });

  test("Delete a story", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      deleteStory: { storyId: string };
    }>(DELETE_STORY, {
      input: { sceneId, storyId }
    });

    expect(status).toBe(200);
    expect(data.deleteStory.storyId).toBe(storyId);
  });
});

// Story page lifecycle

test.describe("Story page lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;
  let storyId: string;
  let pageId: string;
  let secondPageId: string;
  let layerId: string;

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
        name: "Story Page Test",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;

    const { data: story } = await gqlClient.mutate<{
      createStory: { story: { id: string } };
    }>(CREATE_STORY, {
      input: { sceneId, title: "Page Test Story", index: 0 }
    });
    storyId = story.createStory.story.id;
  });

  test("Create a story page", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createStoryPage: {
        story: { id: string; pages: StoryPage[] };
        page: StoryPage;
      };
    }>(CREATE_STORY_PAGE, {
      input: { sceneId, storyId, title: "First Page", swipeable: false }
    });

    expect(status).toBe(200);
    expect(data.createStoryPage.page.title).toBe("First Page");
    expect(data.createStoryPage.page.swipeable).toBe(false);
    pageId = data.createStoryPage.page.id;
  });

  test("Create a second page", async ({ gqlClient }) => {
    const { data } = await gqlClient.mutate<{
      createStoryPage: { page: StoryPage };
    }>(CREATE_STORY_PAGE, {
      input: { sceneId, storyId, title: "Second Page", swipeable: true }
    });

    secondPageId = data.createStoryPage.page.id;
  });

  test("Update a story page title", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      updateStoryPage: { page: StoryPage };
    }>(UPDATE_STORY_PAGE, {
      input: { sceneId, storyId, pageId, title: "Renamed Page" }
    });

    expect(status).toBe(200);
    expect(data.updateStoryPage.page.title).toBe("Renamed Page");
  });

  test("Move a story page to a new position", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      moveStoryPage: {
        story: { id: string; pages: { id: string; title: string }[] };
        page: { id: string; title: string };
      };
    }>(MOVE_STORY_PAGE, {
      input: { storyId, pageId: secondPageId, index: 0 }
    });

    expect(status).toBe(200);
    expect(data.moveStoryPage.page.id).toBe(secondPageId);
    expect(data.moveStoryPage.story.pages[0].id).toBe(secondPageId);
  });

  test("Duplicate a story page", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      duplicateStoryPage: {
        story: { id: string; pages: { id: string }[] };
        page: { id: string; title: string };
      };
    }>(DUPLICATE_STORY_PAGE, {
      input: { sceneId, storyId, pageId }
    });

    expect(status).toBe(200);
    // The duplicated page should be a new page
    expect(data.duplicateStoryPage.page.id).not.toBe(pageId);
    expect(data.duplicateStoryPage.story.pages.length).toBeGreaterThanOrEqual(
      3
    );
  });

  test("Remove a story page", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeStoryPage: {
        story: { id: string; pages: { id: string }[] };
        pageId: string;
      };
    }>(REMOVE_STORY_PAGE, {
      input: { sceneId, storyId, pageId: secondPageId }
    });

    expect(status).toBe(200);
    expect(data.removeStoryPage.pageId).toBe(secondPageId);
    const remaining = data.removeStoryPage.story.pages.map((p) => p.id);
    expect(remaining).not.toContain(secondPageId);
  });

  // Page layer operations (reuses same project/scene/story)

  test("Add a layer to a story page", async ({ gqlClient }) => {
    // Use a fake layer ID — addPageLayer just stores the reference
    layerId = generateFakeId();

    const { status, data } = await gqlClient.mutate<{
      addPageLayer: { page: { id: string; layersIds: string[] } };
    }>(ADD_PAGE_LAYER, {
      input: { sceneId, storyId, pageId, layerId }
    });

    expect(status).toBe(200);
    expect(data.addPageLayer.page.layersIds).toContain(layerId);
  });

  test("Remove a layer from a story page", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removePageLayer: { page: { id: string; layersIds: string[] } };
    }>(REMOVE_PAGE_LAYER, {
      input: { sceneId, storyId, pageId, layerId }
    });

    expect(status).toBe(200);
    expect(data.removePageLayer.page.layersIds).not.toContain(layerId);
  });
});

// Story blocks

test.describe("Story block lifecycle via API", () => {
  let projectId: string;
  let sceneId: string;
  let storyId: string;
  let pageId: string;
  let blockId: string;
  let secondBlockId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project, scene, story, and page", async ({
    gqlClient
  }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Story Block Test",
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    sceneId = sc.createScene.scene.id;

    const { data: story } = await gqlClient.mutate<{
      createStory: { story: { id: string } };
    }>(CREATE_STORY, {
      input: { sceneId, title: "Block Test Story", index: 0 }
    });
    storyId = story.createStory.story.id;

    const { data: page } = await gqlClient.mutate<{
      createStoryPage: { page: { id: string } };
    }>(CREATE_STORY_PAGE, {
      input: { sceneId, storyId, title: "Block Page" }
    });
    pageId = page.createStoryPage.page.id;
  });

  test("Create a text story block", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      createStoryBlock: {
        block: StoryBlock;
        page: { id: string; blocks: StoryBlock[] };
      };
    }>(CREATE_STORY_BLOCK, {
      input: {
        storyId,
        pageId,
        pluginId: "reearth",
        extensionId: "textStoryBlock"
      }
    });

    expect(status).toBe(200);
    expect(data.createStoryBlock.block.extensionId).toBe("textStoryBlock");
    blockId = data.createStoryBlock.block.id;
  });

  test("Create a second story block", async ({ gqlClient }) => {
    const { data } = await gqlClient.mutate<{
      createStoryBlock: { block: StoryBlock };
    }>(CREATE_STORY_BLOCK, {
      input: {
        storyId,
        pageId,
        pluginId: "reearth",
        extensionId: "imageStoryBlock"
      }
    });

    secondBlockId = data.createStoryBlock.block.id;
  });

  test("Move a story block to a new position", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      moveStoryBlock: {
        page: { id: string; blocks: StoryBlock[] };
        blockId: string;
      };
    }>(MOVE_STORY_BLOCK, {
      input: { storyId, pageId, blockId: secondBlockId, index: 0 }
    });

    expect(status).toBe(200);
    expect(data.moveStoryBlock.blockId).toBe(secondBlockId);
    expect(data.moveStoryBlock.page.blocks[0].id).toBe(secondBlockId);
  });

  test("Remove a story block", async ({ gqlClient }) => {
    const { status, data } = await gqlClient.mutate<{
      removeStoryBlock: {
        page: { id: string; blocks: StoryBlock[] };
        blockId: string;
      };
    }>(REMOVE_STORY_BLOCK, {
      input: { storyId, pageId, blockId }
    });

    expect(status).toBe(200);
    expect(data.removeStoryBlock.blockId).toBe(blockId);
    const remaining = data.removeStoryBlock.page.blocks.map((b) => b.id);
    expect(remaining).not.toContain(blockId);
  });
});

// checkStoryAlias query
test.describe("checkStoryAlias query", () => {
  test("A random alias is available", async ({ gqlClient }) => {
    const alias = `story-${faker.string.alphanumeric(12).toLowerCase()}`;
    const { status, data } = await gqlClient.query<{
      checkStoryAlias: { alias: string; available: boolean };
    }>(CHECK_STORY_ALIAS, { alias });

    expect(status).toBe(200);
    expect(data.checkStoryAlias.alias).toBe(alias);
    expect(data.checkStoryAlias.available).toBe(true);
  });
});

// Negative scenarios
test.describe("Storytelling negative scenarios", () => {
  test("Cannot create a story on a non-existent scene", async ({
    gqlClient
  }) => {
    const fakeSceneId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_STORY, {
        input: { sceneId: fakeSceneId, title: "Ghost Story", index: 0 }
      })
    ).rejects.toThrow();
  });

  test("Cannot update a non-existent story", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeStoryId = generateFakeId();
    await expect(
      gqlClient.mutate(UPDATE_STORY, {
        input: { sceneId: fakeSceneId, storyId: fakeStoryId, title: "Nope" }
      })
    ).rejects.toThrow();
  });

  test("Cannot delete a non-existent story", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeStoryId = generateFakeId();
    await expect(
      gqlClient.mutate(DELETE_STORY, {
        input: { sceneId: fakeSceneId, storyId: fakeStoryId }
      })
    ).rejects.toThrow();
  });

  test("Cannot create a page on a non-existent story", async ({
    gqlClient
  }) => {
    const fakeSceneId = generateFakeId();
    const fakeStoryId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_STORY_PAGE, {
        input: { sceneId: fakeSceneId, storyId: fakeStoryId, title: "Nope" }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent story page", async ({ gqlClient }) => {
    const fakeSceneId = generateFakeId();
    const fakeStoryId = generateFakeId();
    const fakePageId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_STORY_PAGE, {
        input: {
          sceneId: fakeSceneId,
          storyId: fakeStoryId,
          pageId: fakePageId
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot create a block on a non-existent story", async ({
    gqlClient
  }) => {
    const fakeStoryId = generateFakeId();
    const fakePageId = generateFakeId();
    await expect(
      gqlClient.mutate(CREATE_STORY_BLOCK, {
        input: {
          storyId: fakeStoryId,
          pageId: fakePageId,
          pluginId: "reearth",
          extensionId: "textStoryBlock"
        }
      })
    ).rejects.toThrow();
  });

  test("Cannot remove a non-existent story block", async ({ gqlClient }) => {
    const fakeStoryId = generateFakeId();
    const fakePageId = generateFakeId();
    const fakeBlockId = generateFakeId();
    await expect(
      gqlClient.mutate(REMOVE_STORY_BLOCK, {
        input: {
          storyId: fakeStoryId,
          pageId: fakePageId,
          blockId: fakeBlockId
        }
      })
    ).rejects.toThrow();
  });
});
