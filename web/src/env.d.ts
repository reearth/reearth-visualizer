/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

declare module "*.yml" {
  const yml: any;
  export default yml;
}

declare module "*.yaml" {
  const yml: any;
  export default yml;
}

declare global {
  interface Window {
    React?: any;
    ReactDOM?: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ImportMetaEnv = {};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
