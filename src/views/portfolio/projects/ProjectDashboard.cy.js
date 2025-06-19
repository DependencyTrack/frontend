import ProjectDashboard from './ProjectDashboard.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ProjectDashboard', () => {
  it('mounts successfully', () => {
    cy.setToken(['PORTFOLIO_MANAGEMENT']);

    cy.mount(ProjectDashboard, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/metrics/project/123456-abcdef/days/90': [
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
      propsData: {
        uuid: '123456-abcdef',
        project: {
          collectionLogic: 'NONE',
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
