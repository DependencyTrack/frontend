import Hex from './Hex.vue';

describe('Hex', () => {
  it('mounts successfully', () => {
    cy.mount(Hex);

    cy.get('div.card').should('be.visible');
  });
});
