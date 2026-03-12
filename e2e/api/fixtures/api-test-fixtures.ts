/* eslint-disable react-hooks/rules-of-hooks */
import fs from "fs";
import path from "path";

import { test as base, expect } from "@playwright/test";

import { GraphQLClient } from "../graphql/client";

const tokenPath = path.join(__dirname, "../../.auth/api-token.json");

export const test = base.extend<{ gqlClient: GraphQLClient }>({
  gqlClient: async ({ request }, use) => {
    const { token, extraHeaders } = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
    await use(new GraphQLClient(request, token, extraHeaders));
  }
});

export { expect };
