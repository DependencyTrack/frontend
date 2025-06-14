/*
TODO this test hangs after execution
import Project from './Project.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Project', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.mount(Project, {
      prototypeMocks: {
        $route: {
          params: {
            uuid: '123456-abcdef',
            componentUuids: [],
          },
          fullPath: '/projects/123456-abcdef/overview',
        },
        $router: {
          replace: cy.stub(),
        },
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
            '/api/v1/project/123456-abcdef': {
              name: 'project',
            },
          }),
        },
      },
      propsData: {
        project: {
          uuid: '123456-abcdef',
          name: 'project',
          active: true,
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
 */
