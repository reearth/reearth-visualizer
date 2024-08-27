import { describe, it, expect } from "vitest";

import { convertData, type Mapping } from "./convert-object"; // Update with actual path

const mapping: Mapping = {
  "user.name": "fullName",
  "user.age": "userAge",
  "user.address.street": "location.address.street",
  "user.address.city": "location.address.city",
  "user.address.zip": "location.address.zipCode",
  "user.friends": [
    "contacts",
    {
      name: "fullName",
      age: "userAge",
    },
  ],
};
describe("convertData", () => {
  it("should convert flat properties", () => {
    const sourceData = {
      user: {
        name: "John Doe",
        age: 30,
      },
    };
    const expectedTargetData = {
      fullName: "John Doe",
      userAge: 30,
    };
    expect(convertData(sourceData, mapping)).toEqual(expectedTargetData);
  });

  it("should convert nested properties", () => {
    const sourceData = {
      user: {
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
      },
    };
    const expectedTargetData = {
      location: {
        address: {
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
        },
      },
    };
    expect(convertData(sourceData, mapping)).toEqual(expectedTargetData);
  });

  it("should convert array properties", () => {
    const sourceData = {
      user: {
        friends: [
          { name: "Jane Doe", age: 28 },
          { name: "Jim Beam", age: 35 },
        ],
      },
    };
    const expectedTargetData = {
      contacts: [
        { fullName: "Jane Doe", userAge: 28 },
        { fullName: "Jim Beam", userAge: 35 },
      ],
    };
    expect(convertData(sourceData, mapping)).toEqual(expectedTargetData);
  });

  it("should handle mixed properties", () => {
    const sourceData = {
      user: {
        name: "John Doe",
        age: 30,
        address: {
          street: "123 Main St",
          city: "Anytown",
          zip: "12345",
        },
        friends: [
          { name: "Jane Doe", age: 28 },
          { name: "Jim Beam", age: 35 },
        ],
      },
    };
    const expectedTargetData = {
      fullName: "John Doe",
      userAge: 30,
      location: {
        address: {
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
        },
      },
      contacts: [
        { fullName: "Jane Doe", userAge: 28 },
        { fullName: "Jim Beam", userAge: 35 },
      ],
    };
    expect(convertData(sourceData, mapping)).toEqual(expectedTargetData);
  });
});
