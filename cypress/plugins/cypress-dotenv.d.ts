///<reference types="cypress" />

declare module "cypress-dotenv" {
  import { DotenvConfigOptions } from "dotenv";

  const dotenv: (
    config: Cypress.PluginConfigOptions,
    options?: DotenvConfigOptions,
    loadAll?: boolean,
  ) => Cypress.PluginConfigOptions;
  export default dotenv;
}
