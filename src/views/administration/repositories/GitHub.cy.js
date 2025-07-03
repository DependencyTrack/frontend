import GitHub from './GitHub.vue';

describe('GitHub', () => {
  it('mounts successfully', () => {
    cy.mount(GitHub);

    cy.get('div.card').should('be.visible');
  });
});
