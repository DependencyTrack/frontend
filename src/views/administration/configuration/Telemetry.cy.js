import Telemetry from './Telemetry.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('Telemetry', () => {
  it('mounts successfully', () => {
    cy.mount(Telemetry, {
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
