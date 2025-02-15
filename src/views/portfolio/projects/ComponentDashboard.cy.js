import ComponentDashboard from './ComponentDashboard.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ComponentDashboard', () => {
  it('mounts successfully', () => {
    cy.setToken(['PORTFOLIO_MANAGEMENT']);

    cy.mount(ComponentDashboard, {
      prototypeMocks: {
        $route: {
          params: {
            uuid: '123456-abcdef',
          },
        },
        axios: {
          get: genAxiosResponse({
            '/api/v1/metrics/component/123456-abcdef/days/90': [
              {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                unassigned: 0,
                inheritedRiskScore: 0,
              },
            ],
          }),
        },
      },
    });

    cy.get('div').should('be.visible');
  });
});
