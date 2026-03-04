import { APIRequestContext } from "@playwright/test";

import { GRAPHQL_ENDPOINT } from "../config/env";

type GQLResponse<T = Record<string, unknown>> = {
  data?: T;
  errors?: { message: string; path?: string[] }[];
};

export class GraphQLClient {
  constructor(
    private request: APIRequestContext,
    private authToken: string,
    private extraHeaders: Record<string, string> = {}
  ) {}

  async execute<T = Record<string, unknown>>(
    query: string,
    variables?: Record<string, unknown>
  ) {
    const res = await this.request.post(GRAPHQL_ENDPOINT, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        ...this.extraHeaders
      },
      data: { query, variables }
    });

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(`GraphQL request failed (${res.status()}): ${text.slice(0, 200)}`);
    }

    const body = (await res.json()) as GQLResponse<T>;
    if (body.errors?.length) {
      console.error("GraphQL errors:", JSON.stringify(body.errors, null, 2));
    }
    return body;
  }

  private async run<T = Record<string, unknown>>(
    op: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const { data, errors } = await this.execute<T>(op, variables);
    if (errors?.length) {
      throw new Error(errors.map(e => e.message).join(", "));
    }
    if (!data) throw new Error("No data returned from GraphQL");
    return data;
  }

  query<T = Record<string, unknown>>(
    query: string,
    variables?: Record<string, unknown>
  ) {
    return this.run<T>(query, variables);
  }

  mutate<T = Record<string, unknown>>(
    mutation: string,
    variables?: Record<string, unknown>
  ) {
    return this.run<T>(mutation, variables);
  }
}
