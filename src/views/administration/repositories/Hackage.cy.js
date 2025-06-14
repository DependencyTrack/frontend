import Hackage from './Hackage.vue';

describe('Hackage', () => {
  it('mounts successfully', () => {
    cy.mount(Hackage);

    cy.get('div.card').should('be.visible');
  });
});
