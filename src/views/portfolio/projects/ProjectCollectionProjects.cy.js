import ProjectCollectionProjects from './ProjectCollectionProjects.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ProjectCollectionProjects', () => {
  it('mounts successfully', () => {
    cy.setToken([]);

    cy.mount(ProjectCollectionProjects, {
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
          }),
        },
      },
    });

    cy.get('#projectsToolbar').should('be.visible');
  });
});
