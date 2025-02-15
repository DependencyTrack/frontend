import DefaultContainer from './DefaultContainer.vue';

describe('DefaultContainer', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(DefaultContainer, {
      stubs: {
        RouterView: true,
      },
      prototypeMocks: {
        $route: {
          name: 'Home',
          meta: {
            sectionName: 'Test Section',
            i18n: 'message.test_section',
            sectionPath: '/test-section',
          },
        },
      },
    });

    cy.get('.app').should('exist');
  });
});
