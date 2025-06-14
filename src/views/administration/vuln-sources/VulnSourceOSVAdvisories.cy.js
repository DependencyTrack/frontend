import VulnSourceOSVAdvisories from './VulnSourceOSVAdvisories.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('VulnSourceOSVAdvisories', () => {
  it('mounts successfully', () => {
    cy.mount(VulnSourceOSVAdvisories, {
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
