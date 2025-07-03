import ProjectList from './ProjectList.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('ProjectList', () => {
  it('mounts successfully', () => {
    cy.setToken([]);

    cy.mount(ProjectList, {
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
