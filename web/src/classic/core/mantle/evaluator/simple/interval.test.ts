import { expect, test } from "vitest";

import { evalTimeInterval } from "./interval";

test("evalTimeInterval", () => {
  expect(
    evalTimeInterval(
      [
        {
          type: "feature",
          id: "a",
          properties: {
            time: "2023-02-03T00:00:00.000Z",
          },
        },
      ],
      { property: "time" },
    ),
  ).toEqual([[new Date("2023-02-03T00:00:00.000Z"), undefined]]);

  expect(
    evalTimeInterval(
      [
        {
          type: "feature",
          id: "d",
          properties: {
            time: "2024-02-03T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "b",
          properties: {
            time: "2023-02-04T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "a",
          properties: {
            time: "2023-02-03T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "c",
          properties: {
            time: "2023-02-05T00:00:00.000Z",
          },
        },
      ],
      { property: "time" },
    ),
  ).toEqual([
    [new Date("2023-02-03T00:00:00.000Z"), new Date("2023-02-04T00:00:00.000Z")],
    [new Date("2023-02-04T00:00:00.000Z"), new Date("2023-02-05T00:00:00.000Z")],
    [new Date("2023-02-05T00:00:00.000Z"), new Date("2024-02-03T00:00:00.000Z")],
    [new Date("2024-02-03T00:00:00.000Z"), undefined],
  ]);

  expect(
    evalTimeInterval(
      [
        {
          type: "feature",
          id: "d",
          properties: {
            time: "2024-02-03T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "b",
          properties: {
            time: "2023-02-04T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "a",
          properties: {
            time: "2023-02-03T00:00:00.000Z",
          },
        },
        {
          type: "feature",
          id: "c",
          properties: {
            time: "2023-02-05T00:00:00.000Z",
          },
        },
      ],
      { property: "time", interval: 1000 },
    ),
  ).toEqual([
    [new Date("2023-02-03T00:00:00.000Z"), new Date("2023-02-03T00:00:01.000Z")],
    [new Date("2023-02-04T00:00:00.000Z"), new Date("2023-02-04T00:00:01.000Z")],
    [new Date("2023-02-05T00:00:00.000Z"), new Date("2023-02-05T00:00:01.000Z")],
    [new Date("2024-02-03T00:00:00.000Z"), new Date("2024-02-03T00:00:01.000Z")],
  ]);
});
