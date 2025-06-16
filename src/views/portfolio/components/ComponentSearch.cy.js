import ComponentSearch from './ComponentSearch.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ComponentSearch', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(ComponentSearch, {
      prototypeMocks: {
        $route: {
          hash: '',
        },
        axios: {
          get: genAxiosResponse({
            '/api/v1/metrics/portfolio/90/days': [
              {
                vulnerabilities: 0,
                vulnerableComponents: 0,
                inheritedRiskScore: 0,
                firstOccurrence: 0,
                vulnerableProjects: 0,
              },
            ],
          }),
        },
      },
    });

    cy.get('.componentSearch').should('exist');
  });
});
