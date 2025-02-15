import ManagedUsers from './ManagedUsers.vue';

describe('ManagedUsers', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(ManagedUsers, {
      propsData: {
        header: 'Managed Users',
      },
    });

    cy.get('.card-body').should('exist');
    cy.get('#customToolbar').should('exist');
  });
});
