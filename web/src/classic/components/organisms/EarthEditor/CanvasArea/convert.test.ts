import { expect, test } from "vitest";

import {
  EarthLayer5Fragment,
  EarthLayerFragment,
  Maybe,
  PropertyFragmentFragment,
  ValueType,
} from "@reearth/classic/gql";

import {
  processLayer,
  processProperty,
  type Layer,
  DatasetMap,
  datasetValue,
  extractDatasetSchemas,
  RawLayer,
} from "./convert";

const dummyLayer: EarthLayer5Fragment = {
  id: "01gw78zrxak1r34xgjeawayem5",
  name: "",
  isVisible: true,
  pluginId: null,
  extensionId: null,
  scenePlugin: null,
  propertyId: null,
  property: null,
  tags: [],
  infobox: null,
  linkedDatasetSchemaId: null,
  layers: [
    {
      id: "01h1xptyc7jdjkkdzh3yfv5s9x",
      __typename: "LayerGroup",
      name: "hoge.csv",
      isVisible: true,
      pluginId: "reearth",
      extensionId: "marker",
      scenePlugin: null,
      propertyId: "01h1xptyc7jdjkkdzh3yp2bcsy",
      tags: [],
      infobox: null,
      linkedDatasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
      property: {
        id: "01h1xptyc7jdjkkdzh3yp2bcsy",
        schema: {
          __typename: "PropertySchema",
          id: "reearth/marker",
          groups: [
            {
              __typename: "PropertySchemaGroup",
              schemaGroupId: "default",
              translatedTitle: "",
              isList: false,
              fields: [
                {
                  __typename: "PropertySchemaField",
                  description: "",
                  translatedTitle: "",
                  translatedDescription: "",
                  title: "location",
                  fieldId: "location",
                  type: ValueType.Latlng,
                },
                {
                  __typename: "PropertySchemaField",
                  fieldId: "imageSize",
                  title: "imageSize",
                  description: "",
                  translatedTitle: "",
                  translatedDescription: "",
                  type: ValueType.Number,
                },
              ],
            },
          ],
        },
        items: [
          {
            id: "01h1xptyc7jdjkkdzh40srxcxh",
            schemaGroupId: "default",
            fields: [
              {
                id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_location",
                fieldId: "location",
                type: ValueType.Latlng,
                value: null,
                links: [
                  {
                    datasetId: null,
                    datasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
                    datasetSchemaFieldId: "01h1xpth3npn29h18t86pw9bh5",
                    __typename: "PropertyFieldLink",
                  },
                ],
                __typename: "PropertyField",
              },
              {
                id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_imageSize",
                fieldId: "imageSize",
                type: ValueType.Number,
                value: 2,
                links: null,
                __typename: "PropertyField",
              },
            ],
            __typename: "PropertyGroup",
          },
        ],
        __typename: "Property",
      },
      layers: [
        {
          id: "01h1xptyc7jdjkkdzh4188qjge",
          __typename: "LayerItem",
          name: "",
          isVisible: true,
          pluginId: "reearth",
          extensionId: "marker",
          scenePlugin: null,
          propertyId: "01h1xptyc7jdjkkdzh41qk0tew",
          property: {
            id: "01h1xptyc7jdjkkdzh41qk0tew",
            schema: {
              __typename: "PropertySchema",
              id: "reearth/marker",
              groups: [
                {
                  __typename: "PropertySchemaGroup",
                  schemaGroupId: "default",
                  translatedTitle: "",
                  isList: false,
                  fields: [
                    {
                      __typename: "PropertySchemaField",
                      description: "",
                      translatedTitle: "",
                      translatedDescription: "",
                      title: "location",
                      fieldId: "location",
                      type: ValueType.Latlng,
                    },
                    {
                      __typename: "PropertySchemaField",
                      fieldId: "imageSize",
                      title: "imageSize",
                      description: "",
                      translatedTitle: "",
                      translatedDescription: "",
                      type: ValueType.Number,
                    },
                  ],
                },
              ],
            },
            items: [],
            __typename: "Property",
          },
          tags: [],
          infobox: null,
          linkedDatasetId: "01h1xpth3npn29h18t8ajsrdjx",
        },
        {
          id: "01h1xptyc7jdjkkdzh46gc955p",
          __typename: "LayerItem",
          name: "",
          isVisible: true,
          pluginId: "reearth",
          extensionId: "marker",
          scenePlugin: {
            property: null,
            __typename: "ScenePlugin",
          },
          propertyId: "01h1xptyc7jdjkkdzh47tz3yyb",
          property: {
            id: "01h1xptyc7jdjkkdzh47tz3yyb",
            schema: {
              __typename: "PropertySchema",
              id: "reearth/marker",
              groups: [
                {
                  __typename: "PropertySchemaGroup",
                  schemaGroupId: "default",
                  translatedTitle: "",
                  isList: false,
                  fields: [
                    {
                      __typename: "PropertySchemaField",
                      description: "",
                      translatedTitle: "",
                      translatedDescription: "",
                      title: "location",
                      fieldId: "location",
                      type: ValueType.Latlng,
                    },
                    {
                      __typename: "PropertySchemaField",
                      fieldId: "imageSize",
                      title: "imageSize",
                      description: "",
                      translatedTitle: "",
                      translatedDescription: "",
                      type: ValueType.Number,
                    },
                  ],
                },
              ],
            },
            items: [
              {
                id: "01h4396a7z52v1ncwp8sv85xsg",
                schemaGroupId: "default",
                fields: [
                  {
                    id: "01h1xptyc7jdjkkdzh47tz3yyb_01h4396a7z52v1ncwp8sv85xsg_imageSize",
                    fieldId: "imageSize",
                    type: ValueType.Number,
                    value: 10,
                    links: null,
                    __typename: "PropertyField",
                  },
                ],
                __typename: "PropertyGroup",
              },
            ],
            __typename: "Property",
          },
          tags: [],
          infobox: {
            propertyId: "01h439hfsm0435zdy4s2dt1ws5",
            property: {
              id: "01h439hfsm0435zdy4s2dt1ws5",
              items: [],
              schema: {
                id: "reearth/infobox",
                groups: [],
              },
              __typename: "Property",
            },
            fields: [
              {
                id: "01h439hm64s8chq75b9z4er4kr",
                pluginId: "reearth",
                extensionId: "textblock",
                propertyId: "01h439hm64s8chq75b9wh717ng",
                scenePlugin: {
                  property: null,
                  __typename: "ScenePlugin",
                },
                property: {
                  id: "01h439hm64s8chq75b9wh717ng",
                  schema: {
                    id: "reearth/textblock",
                    groups: [],
                  },
                  items: [],
                  __typename: "Property",
                },
                __typename: "InfoboxField",
              },
            ],
            __typename: "Infobox",
          },
          linkedDatasetId: "01h1xpth3npn29h18t8g6e0kga",
        },
      ],
    },
  ],
  __typename: "LayerGroup",
};

// /api/datasets/01h1xpth3npn29h18t875d8gvk.json
const dummyDatasets: DatasetMap = {
  "01h1xpth3npn29h18t875d8gvk": {
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "#/schema/01h1xpth3npn29h18t875d8gvk",
      properties: {
        "": {
          $id: "#/properties/id",
        },
        location: {
          $id: "#/properties/01h1xpth3npn29h18t86pw9bh5",
        },
      },
    },
    datasets: [
      {
        "": "01h1xpth3npn29h18t8ajsrdjx",
        location: { lat: 0, lng: 0 },
      },
      {
        "": "01h1xpth3npn29h18t8g6e0kga",
        location: { lat: 10, lng: 10 },
      },
    ],
  },
};

test("extractDatasetSchemas", () => {
  expect(extractDatasetSchemas(dummyLayer as RawLayer)).toEqual(["01h1xpth3npn29h18t875d8gvk"]);
});

test("processLayer", () => {
  const expected: Layer = {
    id: "01gw78zrxak1r34xgjeawayem5",
    pluginId: "",
    extensionId: "",
    isVisible: true,
    title: "",
    tags: [],
    children: [
      {
        id: "01h1xptyc7jdjkkdzh3yfv5s9x",
        pluginId: "reearth",
        extensionId: "marker",
        isVisible: true,
        title: "hoge.csv",
        propertyId: "01h1xptyc7jdjkkdzh3yp2bcsy",
        tags: [],
        children: [
          {
            id: "01h1xptyc7jdjkkdzh4188qjge",
            pluginId: "reearth",
            extensionId: "marker",
            isVisible: true,
            title: "",
            property: {
              default: {
                location: {
                  lat: 0,
                  lng: 0,
                }, // vaue come from dataset
                imageSize: 2, // parent property value (not overridden)
              },
            },
            propertyId: "01h1xptyc7jdjkkdzh41qk0tew",
            tags: [],
          },
          {
            id: "01h1xptyc7jdjkkdzh46gc955p",
            pluginId: "reearth",
            extensionId: "marker",
            isVisible: true,
            title: "",
            property: {
              default: {
                imageSize: 10, // overridden value
                location: {
                  // vaue come from dataset
                  lat: 10,
                  lng: 10,
                },
              },
            },
            propertyId: "01h1xptyc7jdjkkdzh47tz3yyb",
            infobox: {
              property: {},
              blocks: [
                {
                  id: "01h439hm64s8chq75b9z4er4kr",
                  pluginId: "reearth",
                  extensionId: "textblock",
                  property: {},
                  propertyId: "01h439hm64s8chq75b9wh717ng",
                },
              ],
            },
            tags: [],
          },
        ],
      },
    ],
  };

  const p = processLayer(dummyLayer as RawLayer, undefined, dummyDatasets);
  // console.log(JSON.stringify(p, null, 2));
  expect(p).toEqual(expected);
});

test("proceessProperty", () => {
  const parent: Maybe<PropertyFragmentFragment> = {
    id: "01h1xptyc7jdjkkdzh3yp2bcsy",
    schema: {
      id: "schema",
      groups: [
        {
          __typename: "PropertySchemaGroup",
          isList: false,
          translatedTitle: "",
          schemaGroupId: "default",
          fields: [
            {
              __typename: "PropertySchemaField",
              fieldId: "location",
              title: "location",
              description: "",
              translatedDescription: "",
              type: ValueType.Latlng,
              translatedTitle: "",
            },
            {
              __typename: "PropertySchemaField",
              fieldId: "imageSize",
              title: "imageSize",
              description: "",
              translatedDescription: "",
              type: ValueType.Number,
              translatedTitle: "",
            },
          ],
        },
      ],
    },
    items: [
      {
        id: "01h1xptyc7jdjkkdzh40srxcxh",
        schemaGroupId: "default",
        fields: [
          {
            id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_location",
            fieldId: "location",
            type: ValueType.Latlng,
            value: null,
            links: [
              {
                datasetId: null,
                datasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
                datasetSchemaFieldId: "01h1xpth3npn29h18t86pw9bh5",
                __typename: "PropertyFieldLink",
              },
            ],
            __typename: "PropertyField",
          },
          {
            id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_imageSize",
            fieldId: "imageSize",
            type: ValueType.Number,
            value: 2,
            links: null,
            __typename: "PropertyField",
          },
        ],
        __typename: "PropertyGroup",
      },
    ],
    __typename: "Property",
  };

  const orig: Maybe<EarthLayerFragment["property"]> = {
    id: "01h1xptyc7jdjkkdzh41qk0tew",
    items: [],
    __typename: "Property",
  };

  expect(processProperty(parent, orig, "01h1xpth3npn29h18t8ajsrdjx", dummyDatasets)).toEqual({
    default: {
      location: {
        lat: 0,
        lng: 0,
      }, // vaue come from dataset
      imageSize: 2, // parent property value (not overridden)
    },
  });

  const orig2: Maybe<EarthLayerFragment["property"]> = {
    id: "01h1xptyc7jdjkkdzh47tz3yyb",
    items: [
      {
        id: "01h4396a7z52v1ncwp8sv85xsg",
        schemaGroupId: "default",
        fields: [
          {
            id: "01h1xptyc7jdjkkdzh47tz3yyb_01h4396a7z52v1ncwp8sv85xsg_imageSize",
            fieldId: "imageSize",
            type: ValueType.Number,
            value: 10,
            __typename: "PropertyField",
          },
        ],
        __typename: "PropertyGroup",
      },
    ],
    __typename: "Property",
  };

  expect(processProperty(parent, orig2, "01h1xpth3npn29h18t8g6e0kga", dummyDatasets)).toEqual({
    default: {
      imageSize: 10, // overridden value
      location: {
        // vaue come from dataset
        lat: 10,
        lng: 10,
      },
    },
  });
});

test("datasetValue", () => {
  expect(
    datasetValue(
      dummyDatasets,
      "01h1xpth3npn29h18t875d8gvk",
      "01h1xpth3npn29h18t8g6e0kga",
      "01h1xpth3npn29h18t86pw9bh5",
    ),
  ).toEqual({
    lat: 10,
    lng: 10,
  });
  expect(
    datasetValue(dummyDatasets, "01h1xpth3npn29h18t875d8gvk", "xxx", "locationid"),
  ).toBeUndefined();
});
