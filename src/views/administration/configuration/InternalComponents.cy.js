import InternalComponents from './InternalComponents.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('InternalComponents', () => {
  it('mounts successfully', () => {
    cy.mount(InternalComponents, {
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
