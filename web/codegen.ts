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

// CLASSIC CONFIG

// import { CodegenConfig } from "@graphql-codegen/cli";

// const config: CodegenConfig = {
//   overwrite: true,
//   schema: "../server/gql/*.graphql",
//   documents: [
//     "src/classic/gql/fragments/*.ts",
//     "src/classic/gql/queries/*.ts",
//     "src/classic/**/*.graphql",
//   ],
//   generates: {
//     "./src/classic/gql/graphql-client-api.tsx": {
//       plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
//       config: {
//         useTypeImports: true,
//         scalars: {
//           DateTime: "Date",
//           FileSize: "number",
//           ID: "string",
//           Cursor: "string",
//           URL: "string",
//           Lang: "string",
//           TranslatedString: "{ [lang in string]?: string } | null",
//         },
//       },
//     },
//     "./src/classic/gql/graphql.schema.json": {
//       plugins: ["introspection"],
//     },
//     "./src/classic/gql/fragmentMatcher.json": {
//       plugins: ["fragment-matcher"],
//     },
//   },
// };

// export default config;

// CLASSIC CONFIG
