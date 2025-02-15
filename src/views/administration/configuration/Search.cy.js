import Search from './Search.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Search', () => {
  it('mounts successfully', () => {
    cy.mount(Search, {
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
