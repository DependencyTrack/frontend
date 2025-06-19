import LdapUsers from './LdapUsers.vue';

describe('LdapUsers', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(LdapUsers, {
      propsData: {
        header: 'LDAP Users',
      },
    });

    cy.get('#customToolbar').should('exist');
  });
});
