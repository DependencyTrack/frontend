import WelcomeMessage from './WelcomeMessage.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('WelcomeMessage', () => {
  it('mounts successfully', () => {
    cy.mount(WelcomeMessage, {
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
