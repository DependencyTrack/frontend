import PolicyList from './PolicyList.vue';

describe('PolicyList', () => {
  it('mounts successfully', () => {
    cy.setToken(['POLICY_MANAGEMENT']);

    cy.mount(PolicyList, {
      prototypeMocks: {
        $route: {
          query: {
            searchText: '',
          },
        },
      },
    });

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
