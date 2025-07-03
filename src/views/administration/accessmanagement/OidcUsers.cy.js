import OidcUsers from './OidcUsers.vue';

describe('OidcUsers', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(OidcUsers, {
      propsData: {
        header: 'OIDC Users',
      },
    });

    cy.get('.card-body').should('exist');
    cy.get('#customToolbar').should('exist');
  });
});
