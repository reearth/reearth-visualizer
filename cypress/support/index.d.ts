/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import type { Viewer } from "cesium";
import type { Interception } from "cypress/types/net-stubbing";

declare global {
  namespace Cypress {
    interface ApplicationWindow {
      REEARTH_E2E_ACCESS_TOKEN?: string;
      REEARTH_E2E_CESIUM_VIEWER?: Viewer;
    }

    interface Chainable {
      init(): Chainable<void>;
      login(): Chainable<string>;
      loginAndVisit(
        url: string,
        options?: Partial<Cypress.VisitOptions>,
      ): Chainable<Cypress.AUTWindow>;
      waitForGraphQL(): Chainable<Interception>;
      cesiumViewer(): Chainable<Viewer | undefined>;
    }
  }
}
