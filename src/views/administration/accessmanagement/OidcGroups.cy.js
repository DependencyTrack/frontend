import OidcGroups from './OidcGroups.vue';

describe('OidcGroups', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(OidcGroups, {
      propsData: {
        header: 'OIDC Groups',
      },
    });

    cy.get('.card-body').should('exist');
    cy.get('#customToolbar').should('exist');
  });
});
