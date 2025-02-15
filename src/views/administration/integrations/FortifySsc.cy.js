import FortifySsc from './FortifySsc.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('FortifySsc', () => {
  it('mounts successfully', () => {
    cy.mount(FortifySsc, {
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
