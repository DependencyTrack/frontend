import DefaultContainer from './DefaultContainer.vue';

describe('DefaultContainer', () => {
  it('mounts successfully', () => {
    cy.setToken([
      'VIEW_PORTFOLIO',
      'VIEW_VULNERABILITY',
      'VIEW_POLICY_VIOLATION',
      'SYSTEM_CONFIGURATION',
    ]);

    cy.mount(DefaultContainer, {
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
