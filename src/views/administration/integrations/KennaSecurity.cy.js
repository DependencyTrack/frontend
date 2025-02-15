import KennaSecurity from './KennaSecurity.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('KennaSecurity', () => {
  it('mounts successfully', () => {
    cy.mount(KennaSecurity, {
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
