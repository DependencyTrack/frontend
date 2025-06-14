import Nixpkgs from './Nixpkgs.vue';

describe('Nixpkgs', () => {
  it('mounts successfully', () => {
    cy.mount(Nixpkgs);

    cy.get('div.card').should('be.visible');
  });
});
