import ProjectListView from './ProjectListView.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ProjectListView', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.intercept(
      '/api/v1/project?excludeInactive=true&onlyRoot=true&searchText=&pageSize=10&pageNumber=1',
      [],
    );
    cy.mount(ProjectListView, {
      prototypeMocks: {
        $route: {
          query: {},
        },
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/public/access-management/acl.enabled': {
              propertyValue: 'false',
            },
            '/api/v1/team/visible': [],
            '/api/v1/metrics/portfolio/90/days': [
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

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
