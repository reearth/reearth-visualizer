import { CodegenConfig } from "@graphql-codegen/cli";

const rootGQLDirectory = "src/services/gql/";

const rootGenerateDirectory = `${rootGQLDirectory}__gen__/`;

const config: CodegenConfig = {
  overwrite: true,
  schema: "../server/gql/*.graphql",
  documents: [`${rootGQLDirectory}fragments/*.ts`, `${rootGQLDirectory}queries/*.ts`],
  generates: {
    [rootGenerateDirectory]: {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: "Date",
          FileSize: "number",
          ID: "string",
          Cursor: "string",
          URL: "string",
          Lang: "string",
          TranslatedString: "{ [lang in string]?: string } | null",
          JSON: "any",
        },
      },
    },
    [`${rootGenerateDirectory}/fragmentMatcher.json`]: {
      plugins: ["fragment-matcher"],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
