import { expect, test } from "vitest";

import { EarthLayer5Fragment, EarthLayerFragment, Maybe, ValueType } from "@reearth/services/gql";

import { processLayer, processProperty, type Layer, Datasets } from "./convert";

test.skip("proceessProperty", () => {
  const parent: Maybe<EarthLayerFragment["property"]> = {
    id: "01h1xptyc7jdjkkdzh3yp2bcsy",
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
                // "datasetSchema": {
                //   "id": "01h1xpth3npn29h18t875d8gvk",
                //   "name": "hoge.csv",
                //   "__typename": "DatasetSchema"
                // },
                // "dataset": null,
                // "datasetSchemaField": {
                //   "id": "01h1xpth3npn29h18t86pw9bh5",
                //   "name": "location",
                //   "__typename": "DatasetSchemaField"
                // },
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

  const datasets: Datasets = {
    "01h1xpth3npn29h18t875d8gvk": dummyDataset,
  };

  expect(processProperty(parent, orig, datasets)).toEqual({
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
            links: null,
            __typename: "PropertyField",
          },
        ],
        __typename: "PropertyGroup",
      },
    ],
    __typename: "Property",
  };

  expect(processProperty(parent, orig2, datasets)).toEqual({
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
        property: {
          id: "01h1xptyc7jdjkkdzh3yp2bcsy",
          items: [
            {
              id: "01h1xptyc7jdjkkdzh40srxcxh",
              schemaGroupId: "default",
              fields: [
                {
                  id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_location",
                  fieldId: "location",
                  type: "LATLNG",
                  value: null,
                  links: [
                    {
                      datasetId: null,
                      datasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
                      datasetSchemaFieldId: "01h1xpth3npn29h18t86pw9bh5",
                      datasetSchema: {
                        id: "01h1xpth3npn29h18t875d8gvk",
                        name: "hoge.csv",
                        __typename: "DatasetSchema",
                      },
                      dataset: null,
                      datasetSchemaField: {
                        id: "01h1xpth3npn29h18t86pw9bh5",
                        name: "location",
                        __typename: "DatasetSchemaField",
                      },
                      __typename: "PropertyFieldLink",
                    },
                  ],
                  __typename: "PropertyField",
                },
                {
                  id: "01h1xptyc7jdjkkdzh3yp2bcsy_01h1xptyc7jdjkkdzh40srxcxh_imageSize",
                  fieldId: "imageSize",
                  type: "NUMBER",
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

  const p = processLayer(dummyLayer);
  // console.log(JSON.stringify(p, null, 2));
  expect(p).toEqual(expected);
});

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
                    datasetSchema: {
                      id: "01h1xpth3npn29h18t875d8gvk",
                      name: "hoge.csv",
                      __typename: "DatasetSchema",
                    },
                    dataset: null,
                    datasetSchemaField: {
                      id: "01h1xpth3npn29h18t86pw9bh5",
                      name: "location",
                      __typename: "DatasetSchemaField",
                    },
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
            items: [],
            __typename: "Property",
          },
          tags: [],
          infobox: null,
          linkedDatasetId: "01h1xpth3npn29h18t8ajsrdjx",
          // merged: {
          //   parentId: "01h1xptyc7jdjkkdzh3yfv5s9x",
          //   property: {
          //     originalId: "01h1xptyc7jdjkkdzh41qk0tew",
          //     parentId: "01h1xptyc7jdjkkdzh3yp2bcsy",
          //     linkedDatasetId: "01h1xpth3npn29h18t8ajsrdjx",
          //     groups: [
          //       {
          //         schemaGroupId: "default",
          //         fields: [
          //           {
          //             fieldId: "location",
          //             type: ValueType.Latlng,
          //             actualValue: {
          //               lat: 0,
          //               lng: 0,
          //             },
          //             overridden: false,
          //             links: [
          //               {
          //                 datasetId: "01h1xpth3npn29h18t8ajsrdjx",
          //                 datasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
          //                 datasetSchemaFieldId: "01h1xpth3npn29h18t86pw9bh5",
          //                 datasetSchema: {
          //                   id: "01h1xpth3npn29h18t875d8gvk",
          //                   name: "hoge.csv",
          //                   __typename: "DatasetSchema",
          //                 },
          //                 dataset: {
          //                   id: "01h1xpth3npn29h18t8ajsrdjx",
          //                   name: null,
          //                   __typename: "Dataset",
          //                 },
          //                 datasetSchemaField: {
          //                   id: "01h1xpth3npn29h18t86pw9bh5",
          //                   name: "location",
          //                   __typename: "DatasetSchemaField",
          //                 },
          //                 __typename: "PropertyFieldLink",
          //               },
          //             ],
          //             __typename: "MergedPropertyField",
          //           },
          //           {
          //             fieldId: "imageSize",
          //             type: ValueType.Number,
          //             actualValue: 2,
          //             overridden: false,
          //             links: null,
          //             __typename: "MergedPropertyField",
          //           },
          //         ],
          //         __typename: "MergedPropertyGroup",
          //         groups: [],
          //       },
          //     ],
          //     __typename: "MergedProperty",
          //   },
          //   infobox: null,
          //   __typename: "MergedLayer",
          // },
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
                  items: [],
                  __typename: "Property",
                },
                __typename: "InfoboxField",
              },
            ],
            __typename: "Infobox",
          },
          linkedDatasetId: "01h1xpth3npn29h18t8g6e0kga",
          merged: {
            parentId: "01h1xptyc7jdjkkdzh3yfv5s9x",
            property: {
              originalId: "01h1xptyc7jdjkkdzh47tz3yyb",
              parentId: "01h1xptyc7jdjkkdzh3yp2bcsy",
              linkedDatasetId: "01h1xpth3npn29h18t8g6e0kga",
              groups: [
                {
                  schemaGroupId: "default",
                  fields: [
                    {
                      fieldId: "imageSize",
                      type: ValueType.Number,
                      actualValue: 10,
                      overridden: true,
                      links: null,
                      __typename: "MergedPropertyField",
                    },
                    {
                      fieldId: "location",
                      type: ValueType.Latlng,
                      actualValue: {
                        lat: 10,
                        lng: 10,
                      },
                      overridden: false,
                      links: [
                        {
                          datasetId: "01h1xpth3npn29h18t8g6e0kga",
                          datasetSchemaId: "01h1xpth3npn29h18t875d8gvk",
                          datasetSchemaFieldId: "01h1xpth3npn29h18t86pw9bh5",
                          datasetSchema: {
                            id: "01h1xpth3npn29h18t875d8gvk",
                            name: "hoge.csv",
                            __typename: "DatasetSchema",
                          },
                          dataset: {
                            id: "01h1xpth3npn29h18t8g6e0kga",
                            name: null,
                            __typename: "Dataset",
                          },
                          datasetSchemaField: {
                            id: "01h1xpth3npn29h18t86pw9bh5",
                            name: "location",
                            __typename: "DatasetSchemaField",
                          },
                          __typename: "PropertyFieldLink",
                        },
                      ],
                      __typename: "MergedPropertyField",
                    },
                  ],
                  __typename: "MergedPropertyGroup",
                  groups: [],
                },
              ],
              __typename: "MergedProperty",
            },
            infobox: {
              property: {
                originalId: "01h439hfsm0435zdy4s2dt1ws5",
                parentId: null,
                linkedDatasetId: "01h1xpth3npn29h18t8g6e0kga",
                groups: [],
                __typename: "MergedProperty",
              },
              fields: [
                {
                  originalId: "01h439hm64s8chq75b9z4er4kr",
                  pluginId: "reearth",
                  extensionId: "textblock",
                  property: {
                    originalId: "01h439hm64s8chq75b9wh717ng",
                    parentId: null,
                    linkedDatasetId: "01h1xpth3npn29h18t8g6e0kga",
                    groups: [],
                    __typename: "MergedProperty",
                  },
                  scenePlugin: {
                    property: null,
                    __typename: "ScenePlugin",
                  },
                  __typename: "MergedInfoboxField",
                },
              ],
              __typename: "MergedInfobox",
            },
            __typename: "MergedLayer",
          },
        },
      ],
    },
  ],
  __typename: "LayerGroup",
};

// /api/datasets/01h1xpth3npn29h18t875d8gvk.json
const dummyDataset = [
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    properties: {
      "": {
        title: "ID",
        type: "string",
      },
      location: {
        id: "01h1xpth3npn29h18t86pw9bh5",
        type: "object",
        title: "LatLng",
        required: ["lat", "lng"],
        properties: {
          lat: {
            type: "number",
          },
          lng: {
            type: "number",
          },
        },
      },
      name: {
        id: "name",
        type: "string",
      },
    },
    title: "hoge.csv",
    type: "object",
  },
  {
    "": "01h1xpth3npn29h18t8ajsrdjx",
    location: { lat: 0, lng: 0 },
    name: "a",
  },
  {
    "": "01h1xpth3npn29h18t8g6e0kga",
    location: { lat: 10, lng: 0 },
    name: "b",
  },
];
