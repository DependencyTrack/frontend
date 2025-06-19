import JiraConfig from './JiraConfig.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('JiraConfig', () => {
  it('mounts successfully', () => {
    cy.mount(JiraConfig, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [],
          }),
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
