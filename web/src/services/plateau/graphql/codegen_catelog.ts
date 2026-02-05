import path from "path";
import { fileURLToPath } from "url";

import { CodegenConfig } from "@graphql-codegen/cli";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootGQLDirectory = path.join(__dirname, "base/catalog");
const schemaPath = path.join(__dirname, "schema/schema.graphql");

const rootGenerateDirectory = path.join(rootGQLDirectory, "__gen__/");

const config: CodegenConfig = {
  overwrite: true,
  schema: schemaPath,
  documents: [
    path.join(rootGQLDirectory, "fragments/*.ts"),
    path.join(rootGQLDirectory, "queries/*.ts")
  ],
  generates: {
    [rootGenerateDirectory]: {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false
      },
      config: {
        useTypeImports: true,
        scalar: {
          DateTime: "Date"
        }
      }
    },
    [path.join(rootGenerateDirectory, "fragmentMatcher.json")]: {
      plugins: ["fragment-matcher"]
    }
  },
  ignoreNoDocuments: true
};

export default config;
