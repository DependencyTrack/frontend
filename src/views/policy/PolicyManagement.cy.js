import PolicyManagement from './PolicyManagement.vue';

describe('PolicyManagement', () => {
  it('mounts successfully', () => {
    cy.setToken(['POLICY_MANAGEMENT']);

    cy.mount(PolicyManagement, {
      prototypeMocks: {
        $route: {
          fullPath: '/policy',
          query: {
            searchText: '',
          },
        },
        $router: {
          push: cy.stub(),
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
