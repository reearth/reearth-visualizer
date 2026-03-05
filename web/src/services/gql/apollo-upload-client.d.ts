declare module "apollo-upload-client/UploadHttpLink.mjs" {
  import { ApolloLink } from "@apollo/client/link";

  interface UploadHttpLinkOptions {
    uri?: string;
    useGETForQueries?: boolean;
    isExtractableFile?: (value: unknown) => boolean;
    FormData?: typeof FormData;
    formDataAppendFile?: (
      formData: FormData,
      fieldName: string,
      file: unknown
    ) => void;
    print?: (ast: unknown, originalPrint: (ast: unknown) => string) => string;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
    credentials?: string;
    headers?: Record<string, string>;
    includeExtensions?: boolean;
  }

  export default class UploadHttpLink extends ApolloLink {
    constructor(options?: UploadHttpLinkOptions);
  }
}
