import Permissions from './Permissions.vue';

describe('Permissions', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(Permissions, {
      propsData: {
        header: 'Permissions',
      },
    });

    cy.get('.card-body').should('exist');
  });
});
