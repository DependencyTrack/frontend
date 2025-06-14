import VulnSourceGitHubAdvisories from './VulnSourceGitHubAdvisories.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('VulnSourceGitHubAdvisories', () => {
  it('mounts successfully', () => {
    cy.mount(VulnSourceGitHubAdvisories, {
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
