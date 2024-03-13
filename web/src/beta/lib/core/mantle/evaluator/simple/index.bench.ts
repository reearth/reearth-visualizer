import { bench } from "vitest";

import { evalLayerAppearances } from ".";

const evaluate = async () =>
  await evalLayerAppearances(
    {
      marker: {
        pointColor: "#FF0000",
        pointSize: {
          expression: {
            conditions: [
              ["${$.phone:Numbers[:1].type} === 'iPhone'", "${$.age}"],
              ["${$.phone:Numbers[:1].type} === 'iPhone'", "${$.age}"],
              ["${$.phone:Numbers[:1].type} === 'iPhone'", "${$.age}"],
              ["${$.phone:Numbers[:1].type} === 'iPhone'", "${$.age}"],
              ["true", "1"],
            ],
          },
        },
      },
    },
    {
      id: "x",
      type: "simple",
    },
    {
      type: "feature",
      id: "blah",
      properties: {
        firstName: "John",
        lastName: "doe",
        age: 26,
        address: {
          streetAddress: "naist street",
          city: "Nara",
          postalCode: "630-0192",
        },
        "phone:Numbers": [
          {
            type: "iPhone",
            number: "0123-4567-8888",
          },
          {
            type: "home",
            number: "0123-4567-8910",
          },
        ],
      },
    },
  );

bench("Conditions evaluator", async () => {
  await evaluate();
});
