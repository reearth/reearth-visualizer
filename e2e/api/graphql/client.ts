import { APIRequestContext } from "@playwright/test";

import { GRAPHQL_ENDPOINT } from "../config/env";

type GQLResponse<T = Record<string, unknown>> = {
  data?: T;
  errors?: { message: string; path?: string[] }[];
};

export type GQLResult<T = Record<string, unknown>> = {
  status: number;
  data: T;
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
  ): Promise<{ status: number; body: GQLResponse<T> }> {
    const res = await this.request.post(GRAPHQL_ENDPOINT, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
        ...this.extraHeaders
      },
      data: { query, variables }
    });

    const status = res.status();

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(
        `GraphQL request failed (${status}): ${text.slice(0, 200)}`
      );
    }

    const body = (await res.json()) as GQLResponse<T>;
    if (body.errors?.length) {
      console.error("GraphQL errors:", JSON.stringify(body.errors, null, 2));
    }
    return { status, body };
  }

  async uploadFile<T = Record<string, unknown>>(
    mutation: string,
    variables: Record<string, unknown>,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<GQLResult<T>> {
    const boundary = `----FormBoundary${Date.now()}`;
    const crlf = "\r\n";

    const operations = JSON.stringify({ query: mutation, variables });
    const map = JSON.stringify({ "0": ["variables.file"] });

    const parts: Buffer[] = [];
    const addField = (name: string, value: string) => {
      parts.push(
        Buffer.from(
          `--${boundary}${crlf}` +
            `Content-Disposition: form-data; name="${name}"${crlf}${crlf}` +
            `${value}${crlf}`
        )
      );
    };

    // Order matters: operations must come first
    addField("operations", operations);
    addField("map", map);

    // File part
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}` +
          `Content-Disposition: form-data; name="0"; filename="${fileName}"${crlf}` +
          `Content-Type: ${mimeType}${crlf}${crlf}`
      )
    );
    parts.push(fileBuffer);
    parts.push(Buffer.from(`${crlf}--${boundary}--${crlf}`));

    const body = Buffer.concat(parts);

    const res = await this.request.post(GRAPHQL_ENDPOINT, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${this.authToken}`,
        ...this.extraHeaders
      },
      data: body
    });

    const status = res.status();

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(
        `GraphQL upload failed (${status}): ${text.slice(0, 200)}`
      );
    }

    const respBody = (await res.json()) as GQLResponse<T>;
    if (respBody.errors?.length) {
      throw new Error(respBody.errors.map((e) => e.message).join(", "));
    }
    if (!respBody.data) throw new Error("No data returned from GraphQL upload");
    return { status, data: respBody.data, errors: respBody.errors };
  }

  private async run<T = Record<string, unknown>>(
    op: string,
    variables?: Record<string, unknown>
  ): Promise<GQLResult<T>> {
    const { status, body } = await this.execute<T>(op, variables);
    if (body.errors?.length) {
      throw new Error(body.errors.map((e) => e.message).join(", "));
    }
    if (!body.data) throw new Error("No data returned from GraphQL");
    return { status, data: body.data, errors: body.errors };
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
