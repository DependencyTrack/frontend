import ProjectComponents from './ProjectComponents.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ProjectComponents', () => {
  it('mounts successfully', () => {
    cy.setToken(['PORTFOLIO_MANAGEMENT']);

    cy.mount(ProjectComponents, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({ '/api/v1/license/concise': [] }),
        },
      },
    });

    cy.get('#componentsToolbar').should('be.visible');
  });
});
