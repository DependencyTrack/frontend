import Cargo from './Cargo.vue';

describe('Cargo', () => {
  it('mounts successfully', () => {
    cy.mount(Cargo);

    cy.get('div.card').should('be.visible');
  });
});
