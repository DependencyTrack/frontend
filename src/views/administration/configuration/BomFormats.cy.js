import BomFormats from './BomFormats.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('BomFormats', () => {
  it('mounts successfully', () => {
    cy.mount(BomFormats, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [
              {
                propertyName: 'smtp.enabled',
                propertyValue: 'false',
              },
            ],
          }),
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
