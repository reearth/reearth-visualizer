import { ApolloLink } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

export default (endpoint: string) => {
  return createUploadLink({
    uri: endpoint,
  }) as unknown as ApolloLink;
};
