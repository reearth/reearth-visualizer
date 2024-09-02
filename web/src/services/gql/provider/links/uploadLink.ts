import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

export default (endpoint: string) => {
  return createUploadLink({
    uri: endpoint
  });
};
