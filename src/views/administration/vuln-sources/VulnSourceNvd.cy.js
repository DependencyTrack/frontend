import VulnSourceNvd from './VulnSourceNvd.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('VulnSourceNvd', () => {
  it('mounts successfully', () => {
    cy.mount(VulnSourceNvd, {
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
