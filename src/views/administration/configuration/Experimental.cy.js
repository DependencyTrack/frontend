import Experimental from './Experimental.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Experimental', () => {
  it('mounts successfully', () => {
    cy.mount(Experimental, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [],
          }),
        },
      },
    });

    cy.get('div').should('be.visible');
  });
});
