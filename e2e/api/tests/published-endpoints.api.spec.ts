import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  CREATE_STORY,
  DELETE_PROJECT,
  PUBLISH_PROJECT,
  PUBLISH_STORY,
  UPDATE_PROJECT
} from "../graphql/mutations";
import { GET_ME } from "../graphql/queries";

test.describe.configure({ mode: "serial" });

test.describe("Published project endpoints", () => {
  let workspaceId: string;
  let projectId: string;
  const projectAlias = `pub-proj-${faker.string.alphanumeric(8).toLowerCase()}`;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create and publish project", async ({ gqlClient }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);
    workspaceId = meData.me.myWorkspaceId;

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId,
        visualizer: "CESIUM",
        name: "Published Test Project",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    const { data } = await gqlClient.mutate<{
      publishProject: {
        project: { id: string; alias: string; publishmentStatus: string };
      };
    }>(PUBLISH_PROJECT, {
      input: { projectId, alias: projectAlias, status: "PUBLIC" }
    });

    expect(data.publishProject.project.alias).toBe(projectAlias);
    expect(data.publishProject.project.publishmentStatus).toBe("PUBLIC");
  });

  test("GET /api/published/:name returns metadata for published project", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/api/published/${projectAlias}`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("coreSupport");
  });

  test("GET /api/published/:name returns 404 for non-existent alias", async ({
    request
  }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published/non-existent-${faker.string.alphanumeric(10)}`
    );

    expect(res.status()).toBe(404);
  });

  test("GET /api/published_data/:name returns project data", async ({
    request
  }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published_data/${projectAlias}`
    );

    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("GET /api/published_data/:name returns 404 for non-existent alias", async ({
    request
  }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published_data/non-existent-${faker.string.alphanumeric(10)}`
    );

    expect(res.status()).toBe(404);
  });

  test("GET /p/:name/data.json returns project data", async ({ request }) => {
    const res = await request.get(`${API_BASE_URL}/p/${projectAlias}/data.json`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toBeTruthy();
  });
});

test.describe("Published story endpoints", () => {
  let projectId: string;
  const storyAlias = `pub-story-${faker.string.alphanumeric(8).toLowerCase()}`;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create project, scene, story and publish story", async ({
    gqlClient
  }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: meData.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Story Publish Test",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    const { data: sceneData } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    const sceneId = sceneData.createScene.scene.id;

    const { data: storyData } = await gqlClient.mutate<{
      createStory: { story: { id: string } };
    }>(CREATE_STORY, {
      input: { sceneId, title: "Test Story", index: 0 }
    });
    const storyId = storyData.createStory.story.id;

    const { data } = await gqlClient.mutate<{
      publishStory: {
        story: { id: string; alias: string; publishmentStatus: string };
      };
    }>(PUBLISH_STORY, {
      input: { storyId, alias: storyAlias, status: "PUBLIC" }
    });

    expect(data.publishStory.story.alias).toBe(storyAlias);
    expect(data.publishStory.story.publishmentStatus).toBe("PUBLIC");
  });

  test("GET /api/published/:name returns metadata for published story", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/api/published/${storyAlias}`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("coreSupport");
  });

  test("GET /api/published_data/:name returns story data", async ({
    request
  }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published_data/${storyAlias}`
    );

    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("GET /p/:name/data.json returns story data", async ({ request }) => {
    const res = await request.get(`${API_BASE_URL}/p/${storyAlias}/data.json`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toBeTruthy();
  });
});

test.describe("Published endpoint: unpublish removes access", () => {
  let projectId: string;
  const alias = `pub-unpub-${faker.string.alphanumeric(8).toLowerCase()}`;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create, publish, then unpublish project", async ({
    gqlClient
  }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: meData.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Unpublish Test",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    // Publish
    await gqlClient.mutate(PUBLISH_PROJECT, {
      input: { projectId, alias, status: "PUBLIC" }
    });

    // Unpublish
    await gqlClient.mutate(PUBLISH_PROJECT, {
      input: { projectId, alias: "", status: "PRIVATE" }
    });
  });

  test("GET /api/published/:name returns 404 after unpublish", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/api/published/${alias}`);
    expect(res.status()).toBe(404);
  });
});

test.describe("Published endpoint: basic auth", () => {
  let projectId: string;
  const alias = `pub-auth-${faker.string.alphanumeric(8).toLowerCase()}`;
  const username = "testuser";
  const password = "testpass";

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create project with basic auth and publish", async ({
    gqlClient
  }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: meData.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "BasicAuth Test",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    // Enable basic auth
    await gqlClient.mutate(UPDATE_PROJECT, {
      input: {
        projectId,
        isBasicAuthActive: true,
        basicAuthUsername: username,
        basicAuthPassword: password
      }
    });

    // Publish
    await gqlClient.mutate(PUBLISH_PROJECT, {
      input: { projectId, alias, status: "PUBLIC" }
    });
  });

  test("GET /api/published/:name returns metadata without auth (metadata is unprotected)", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/api/published/${alias}`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("isBasicAuthActive");
  });

  test("GET /p/:name/data.json requires basic auth", async ({ request }) => {
    // Without auth -> 401
    const noAuth = await request.get(`${API_BASE_URL}/p/${alias}/data.json`);
    expect(noAuth.status()).toBe(401);

    // With wrong credentials -> 401
    const wrongAuth = await request.get(`${API_BASE_URL}/p/${alias}/data.json`, {
      headers: {
        Authorization: `Basic ${Buffer.from("wrong:wrong").toString("base64")}`
      }
    });
    expect(wrongAuth.status()).toBe(401);

    // With correct credentials -> 200
    const correctAuth = await request.get(`${API_BASE_URL}/p/${alias}/data.json`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
      }
    });
    expect(correctAuth.status()).toBe(200);
  });

  test("GET /api/published_data/:name returns data even without basic auth credentials", async ({
    request
  }) => {
    // The /api/published_data endpoint does not enforce basic auth
    // (only /p/:name/data.json does), so it should return 200 regardless
    const res = await request.get(
      `${API_BASE_URL}/api/published_data/${alias}`
    );
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});

test.describe("Published endpoint: /p/:name/data.json edge cases", () => {
  test("GET /p/:name/data.json returns 404 for non-existent alias", async ({
    request
  }) => {
    const bogus = `no-such-alias-${faker.string.alphanumeric(10)}`;
    const res = await request.get(`${API_BASE_URL}/p/${bogus}/data.json`);

    expect(res.status()).toBe(404);
  });
});

test.describe("Published endpoint: LIMITED status", () => {
  let projectId: string;
  const alias = `pub-limited-${faker.string.alphanumeric(8).toLowerCase()}`;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create and publish project with LIMITED status", async ({
    gqlClient
  }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: meData.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Limited Publish Test",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    const { data } = await gqlClient.mutate<{
      publishProject: {
        project: { id: string; alias: string; publishmentStatus: string };
      };
    }>(PUBLISH_PROJECT, {
      input: { projectId, alias, status: "LIMITED" }
    });

    expect(data.publishProject.project.publishmentStatus).toBe("LIMITED");
  });

  test("GET /api/published/:name returns metadata for LIMITED project", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/api/published/${alias}`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("coreSupport");
  });

  test("GET /p/:name/data.json returns data for LIMITED project", async ({
    request
  }) => {
    const res = await request.get(`${API_BASE_URL}/p/${alias}/data.json`);

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toBeTruthy();
  });

  test("GET /api/published_data/:name returns data for LIMITED project", async ({
    request
  }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published_data/${alias}`
    );

    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});

test.describe("Published endpoint: re-publish with new alias", () => {
  let projectId: string;
  const firstAlias = `pub-first-${faker.string.alphanumeric(8).toLowerCase()}`;
  const secondAlias = `pub-second-${faker.string.alphanumeric(8).toLowerCase()}`;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted or does not exist
    }
  });

  test("Setup: create, publish, then re-publish with a different alias", async ({
    gqlClient
  }) => {
    const { data: meData } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: projData } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: meData.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: "Republish Alias Test",
        coreSupport: true
      }
    });
    projectId = projData.createProject.project.id;

    await gqlClient.mutate(CREATE_SCENE, { input: { projectId } });

    // First publish
    await gqlClient.mutate(PUBLISH_PROJECT, {
      input: { projectId, alias: firstAlias, status: "PUBLIC" }
    });

    // Re-publish with new alias
    const { data } = await gqlClient.mutate<{
      publishProject: { project: { alias: string; publishmentStatus: string } };
    }>(PUBLISH_PROJECT, {
      input: { projectId, alias: secondAlias, status: "PUBLIC" }
    });

    expect(data.publishProject.project.alias).toBe(secondAlias);
  });

  test("New alias serves content", async ({ request }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published/${secondAlias}`
    );
    expect(res.status()).toBe(200);
  });

  test("Old alias no longer serves content", async ({ request }) => {
    const res = await request.get(
      `${API_BASE_URL}/api/published/${firstAlias}`
    );
    expect(res.status()).toBe(404);
  });
});
