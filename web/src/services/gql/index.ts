export * from "./__gen__/graphql";
export { default as Provider } from "./provider";

//'x-' prefix as a custom header to prevent naming conflicts with official HTTP headers.
export const SKIP_GLOBAL_ERROR = "x-skip-global-error";
