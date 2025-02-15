import DefaultHeaderProfileDropdown from './DefaultHeaderProfileDropdown.vue';

describe('DefaultHeaderProfileDropdown', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(DefaultHeaderProfileDropdown);

    cy.get('.fa-user-circle-o').should('exist');
  });
});
