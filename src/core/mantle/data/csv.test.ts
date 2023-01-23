import { expect, test, vi } from "vitest";

import { fetchCSV } from "./csv";
import * as Utils from "./utils";

test("with header", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `id,country,lat,,lng,height
1,Japan,0,,1,10
2,US,2,,3,
3,UK,4,,5,30
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: "id",
      latColumn: "lat",
      lngColumn: "lng",
      heightColumn: "height",
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1, 10],
      },
      properties: {
        country: "Japan",
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {
        country: "US",
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5, 30],
      },
      properties: {
        country: "UK",
      },
      range: undefined,
    },
  ]);
});

test("has header but set index", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      // lat has no header name
      text: async () => `id,country,,,lng
1,Japan,0,,1
2,US,2,,3
3,UK,4,,5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 100, // This should not found
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: undefined,
      properties: {
        country: "Japan",
        lng: "1",
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "2",
      geometry: undefined,
      properties: {
        country: "US",
        lng: "3",
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: undefined,
      properties: {
        country: "UK",
        lng: "5",
      },
      range: undefined,
    },
  ]);
});

test("has multiline field", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      // lat has no header name
      text: async () => `id,country,lat,text,lng
1,Japan,0,"Hello
World",1
2,US,2,"This is list
- a
- b
- c
",3
3,UK,4,"Hey,
I'm CSV",5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4, // This should not fount.
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {
        country: "Japan",
        text: `Hello
World`,
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {
        country: "US",
        text: `This is list
- a
- b
- c
`,
      },
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {
        country: "UK",
        text: `Hey,
I'm CSV`,
      },
      range: undefined,
    },
  ]);
});

test("without header", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `1,Japan,0,,1
2,US,2,,3
3,UK,4,,5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4,
      noHeader: true,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {},
      range: undefined,
    },
  ]);
});

test("some delimiter", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `1,Japan,0,,1
2;US;2;;3
3\tUK\t4\t\t5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4,
      noHeader: true,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {},
      range: undefined,
    },
  ]);
});

test("invalid parameters", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  const generateRandomStringMock = vi.spyOn(Utils, "generateRandomString");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `id,lat,lng,height
1,abc,1,10
,2,,20
3,,,30
4,100,100,abc
5,200,200,50
`,
    } as Response;
  });
  generateRandomStringMock.mockImplementation(() => "random");

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: "id",
      latColumn: "lat",
      lngColumn: "lng",
      heightColumn: "height",
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      type: "feature",
      id: "1",
      geometry: undefined,
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "random",
      geometry: undefined,
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "3",
      geometry: undefined,
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "4",
      geometry: {
        type: "Point",
        coordinates: [100, 100],
      },
      properties: {},
      range: undefined,
    },
    {
      type: "feature",
      id: "5",
      geometry: {
        type: "Point",
        coordinates: [200, 200, 50],
      },
      properties: {},
      range: undefined,
    },
  ]);
});
