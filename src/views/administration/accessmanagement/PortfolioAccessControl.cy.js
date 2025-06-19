import PortfolioAccessControl from './PortfolioAccessControl.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('PortfolioAccessControl', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(PortfolioAccessControl, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [],
          }),
        },
      },
      propsData: {
        header: 'Portfolio Access Control',
      },
    });

    cy.get('.card-body').should('exist');
    cy.get('#customToolbar').should('exist');
  });
});
