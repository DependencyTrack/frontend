import AdminMenu from './AdminMenu.vue';

describe('AdminMenu', () => {
  it('mounts successfully', () => {
    cy.setToken(['SYSTEM_CONFIGURATION']);

    cy.mount(AdminMenu, {
      prototypeMocks: {
        // TODO these mocks are probably too much, needs to be reduced to the minimum
        $router: {
          resolve: cy.stub().returns({
            location: { path: '/admin' },
            route: {
              path: '/admin',
              hash: '',
              query: {},
            },
            href: '#',
          }),
          options: {
            linkActiveClass: 'open active',
          },
          replace: cy.stub(),
          push: cy.stub(),
        },
        $route: {
          path: '/admin',
          fullPath: '/admin',
          hash: '',
          query: {},
        },
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
