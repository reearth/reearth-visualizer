import { createUploadLink } from "apollo-upload-client";

export default (endpoint: string) => {
  return createUploadLink({
    uri: endpoint,
  });
};
