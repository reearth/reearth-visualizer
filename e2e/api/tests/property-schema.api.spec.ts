import { faker } from "@faker-js/faker";

import { test, expect } from "../fixtures/api-test-fixtures";
import {
  CREATE_PROJECT,
  CREATE_SCENE,
  DELETE_PROJECT,
  UPLOAD_FILE_TO_PROPERTY
} from "../graphql/mutations";
import {
  GET_ME,
  GET_PROPERTY_SCHEMA,
  GET_PROPERTY_SCHEMAS,
  GET_SCENE
} from "../graphql/queries";

import { generateFakeId } from "./test-helpers";

type PropertyItem = {
  id: string;
  schemaGroupId: string;
  schemaId?: string;
  groups?: { id: string; schemaGroupId: string }[];
  fields?: { id: string; fieldId: string; type: string; value: unknown }[];
};

type SceneNode = {
  node: {
    id: string;
    projectId: string;
    property: {
      id: string;
      items: PropertyItem[];
    };
  } | null;
};

test.describe.configure({ mode: "serial" });

test.describe("Property schema queries via API", () => {
  let projectId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project with scene", async ({ gqlClient }) => {
    const { data: me } = await gqlClient.query<{
      me: { myWorkspaceId: string };
    }>(GET_ME);

    const { data: proj } = await gqlClient.mutate<{
      createProject: { project: { id: string } };
    }>(CREATE_PROJECT, {
      input: {
        workspaceId: me.me.myWorkspaceId,
        visualizer: "CESIUM",
        name: `PropSchema Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    const sceneId = sc.createScene.scene.id;

    // Get scene property info
    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    if (!scene.node) throw new Error("scene node is null");
    expect(scene.node.property.id).toBeTruthy();
  });

  test("propertySchema: fetch scene property schema", async ({ gqlClient }) => {
    const schemaId = "reearth/cesium";

    const { status, data } = await gqlClient.query<{
      propertySchema: {
        id: string;
        groups: {
          schemaGroupId: string;
          schemaId: string;
          isList: boolean;
          fields: { fieldId: string; type: string; title: string }[];
        }[];
      } | null;
    }>(GET_PROPERTY_SCHEMA, { id: schemaId });

    expect(status).toBe(200);
    expect(data.propertySchema).not.toBeNull();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const propertySchema = data.propertySchema!;
    expect(propertySchema.id).toBeTruthy();
    expect(propertySchema.groups.length).toBeGreaterThan(0);

    // Verify the tiles group exists with expected fields
    const tilesGroup = propertySchema.groups.find(
      (g) => g.schemaGroupId === "tiles"
    );
    expect(tilesGroup).toBeDefined();
    if (tilesGroup) {
      expect(tilesGroup.isList).toBe(true);
      expect(tilesGroup.fields.length).toBeGreaterThan(0);
    }
  });

  test("propertySchemas: fetch multiple schemas", async ({ gqlClient }) => {
    const schemaId = "reearth/cesium";

    const { status, data } = await gqlClient.query<{
      propertySchemas: {
        id: string;
        groups: {
          schemaGroupId: string;
          fields: { fieldId: string; type: string }[];
        }[];
      }[];
    }>(GET_PROPERTY_SCHEMAS, { id: [schemaId] });

    expect(status).toBe(200);
    expect(data.propertySchemas.length).toBeGreaterThanOrEqual(1);
    expect(data.propertySchemas[0].id).toBeTruthy();
    expect(data.propertySchemas[0].groups.length).toBeGreaterThan(0);
  });

  test("propertySchema: non-existent schema returns null", async ({
    gqlClient
  }) => {
    const { status, data } = await gqlClient.query<{
      propertySchema: { id: string } | null;
    }>(GET_PROPERTY_SCHEMA, { id: "reearth/notfound" });

    expect(status).toBe(200);
    expect(data.propertySchema).toBeNull();
  });

  test("propertySchemas: non-existent schemas throws error", async ({
    gqlClient
  }) => {
    await expect(
      gqlClient.query(GET_PROPERTY_SCHEMAS, { id: ["reearth/notfound"] })
    ).rejects.toThrow();
  });
});

test.describe("Upload file to property via API", () => {
  let projectId: string;
  let propertyId: string;
  let tilesGroupId: string;

  test.afterAll(async ({ gqlClient }) => {
    if (!projectId) return;
    try {
      await gqlClient.mutate(DELETE_PROJECT, { input: { projectId } });
    } catch {
      // already deleted
    }
  });

  test("Setup: create project, scene, and get property", async ({
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
        name: `UploadProp Test ${faker.string.alphanumeric(6)}`,
        coreSupport: true
      }
    });
    projectId = proj.createProject.project.id;

    const { data: sc } = await gqlClient.mutate<{
      createScene: { scene: { id: string } };
    }>(CREATE_SCENE, { input: { projectId } });
    const sceneId = sc.createScene.scene.id;

    const { data: scene } = await gqlClient.query<SceneNode>(GET_SCENE, {
      sceneId
    });
    if (!scene.node) throw new Error("scene node is null");
    propertyId = scene.node.property.id;

    const tilesItem = scene.node.property.items.find(
      (i) => i.schemaGroupId === "tiles"
    );
    if (tilesItem?.groups && tilesItem.groups.length > 0) {
      tilesGroupId = tilesItem.groups[0].id;
    }
  });

  test("Upload a file to a property field", async ({ gqlClient }) => {
    // Create a small test image (1x1 PNG)
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const { status, data } = await gqlClient.uploadFile<{
      uploadFileToProperty: {
        property: { id: string };
        propertyField: { id: string; type: string; value: unknown } | null;
      };
    }>(
      UPLOAD_FILE_TO_PROPERTY,
      {
        propertyId,
        schemaGroupId: "tiles",
        itemId: tilesGroupId || null,
        fieldId: "tile_url"
      },
      pngHeader,
      "test-tile.png",
      "image/png"
    );

    expect(status).toBe(200);
    expect(data.uploadFileToProperty.property.id).toBe(propertyId);
  });
});

test.describe("Property upload negative scenarios", () => {
  test("Cannot upload file to a non-existent property", async ({
    gqlClient
  }) => {
    const fakePropertyId = generateFakeId();
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    await expect(
      gqlClient.uploadFile(
        UPLOAD_FILE_TO_PROPERTY,
        {
          propertyId: fakePropertyId,
          schemaGroupId: "tiles",
          itemId: null,
          fieldId: "tile_url"
        },
        png,
        "test.png",
        "image/png"
      )
    ).rejects.toThrow();
  });
});
