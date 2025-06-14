import DefectDojo from './DefectDojo.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('DefectDojo', () => {
  it('mounts successfully', () => {
    cy.mount(DefectDojo, {
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
