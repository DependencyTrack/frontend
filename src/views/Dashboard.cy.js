import Dashboard from './Dashboard.vue';
import { genAxiosResponse } from '../../cypress/support/utils';

describe('Dashboard', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.mount(Dashboard, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/metrics/portfolio/90/days': [
              {
                vulnerabilities: 0,
                vulnerableProjects: 0,
                vulnerableComponents: 0,
                inheritedRiskScore: 0,
                firstOccurrence: 0,
              },
            ],
          }),
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
