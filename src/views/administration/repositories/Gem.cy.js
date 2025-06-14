import Gem from './Gem.vue';

describe('Gem', () => {
  it('mounts successfully', () => {
    cy.mount(Gem);

    cy.get('div.card').should('be.visible');
  });
});
