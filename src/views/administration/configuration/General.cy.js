import General from './General.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('General', () => {
  it('mounts successfully', () => {
    cy.mount(General, {
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
