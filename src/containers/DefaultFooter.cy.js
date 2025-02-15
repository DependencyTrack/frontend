import DefaultFooter from './DefaultFooter.vue';

describe('DefaultFooter', () => {
  it('mounts successfully', () => {
    cy.mount(DefaultFooter, {
      prototypeMocks: {
        $currentUser: {
          username: 'admin',
        },
      },
    });
  });
});
