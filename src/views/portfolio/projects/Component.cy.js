import Component from '@/views/portfolio/projects/Component.vue';
import { genAxiosResponse } from '/cypress/support/utils';

describe('Component', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(Component, {
      prototypeMocks: {
        $route: {
          params: {
            uuid: 'test-uuid',
          },
          fullPath: '/components/test-uuid',
        },
        $toastr: {
          w: cy.stub(),
        },
        axios: {
          get: genAxiosResponse({
            '/api/v1/component/test-uuid': {
              project: {
                uuid: 'project-uuid',
                name: 'project-name',
                version: '1.0.0',
              },
              isInternal: false,
              externalReferences: [],
              purl: 'purl',
              name: 'component-name',
              group: 'com.example',
            },
            '/api/v1/metrics/component/test-uuid/current': {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              unassigned: 0,
              inheritedRiskScore: 0,
            },
            '/api/v1/metrics/component/test-uuid/days/90': [
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

    cy.get('.animated').should('exist');
  });
});
