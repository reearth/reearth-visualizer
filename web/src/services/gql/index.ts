export * from "./__gen__/graphql";
export { default as Provider } from "./provider";

//'x-' prefix as a custom header to prevent naming conflicts with official HTTP headers.
export const HEADER_KEY_SKIP_GLOBAL_ERROR_NOTIFICATION = "x-skip-global-error";
